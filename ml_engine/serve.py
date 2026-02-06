
import os
import shutil
import io
import torch
import numpy as np
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import LayoutLMv3ForTokenClassification, LayoutLMv3Processor
from PIL import Image
import easyocr

# Configuration
# Tricky: We want to load the fine-tuned model if available, else fallback to base for testing.
FINE_TUNED_MODEL_DIR = "./ml_engine/models/layoutlmv3-finetuned"
BASE_MODEL_NAME = "microsoft/layoutlmv3-base"

app = FastAPI(title="ORC Local Inference API", version="1.0.0")

# CORS (Allow Frontend to hit this directly if needed, or via Next.js proxy)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global State
model = None
processor = None
reader = None

# Entity Label Map (Same as dataset.py)
# We need this to decode the ID predictions back to strings.
# Ideally, we load this from the trained model config.
ID2LABEL = {}

@app.on_event("startup")
def load_artifacts():
    global model, processor, reader, ID2LABEL
    
    print("🚀 Loading OCR Engine (EasyOCR)...")
    reader = easyocr.Reader(['en'], verbose=False)
    
    print(f"📂 Loading Model...")
    # Check if fine-tuned model exists
    model_path = FINE_TUNED_MODEL_DIR if os.path.exists(FINE_TUNED_MODEL_DIR) else BASE_MODEL_NAME
    
    if model_path == BASE_MODEL_NAME:
        print(f"⚠️ Fine-tuned model not found at {FINE_TUNED_MODEL_DIR}. Using BASE model {BASE_MODEL_NAME} for testing.")
    else:
        print(f"✅ Found Fine-Tuned Model at {model_path}")

    try:
        processor = LayoutLMv3Processor.from_pretrained(model_path, apply_ocr=False)
        model = LayoutLMv3ForTokenClassification.from_pretrained(model_path)
        model.eval()
        
        # Load ID2LABEL from config
        ID2LABEL = model.config.id2label
        print(f"✅ Model Loaded. Labels: {ID2LABEL}")
        
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        # Fallback to hardcoded labels for base model to prevent crash? 
        # Base model usually has standard NER labels or 2 labels.
        pass

def normalize_box(box, width, height):
    return [
        int(1000 * (box[0] / width)),
        int(1000 * (box[1] / height)),
        int(1000 * (box[2] / width)),
        int(1000 * (box[3] / height)),
    ]

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if not model or not processor:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # 1. Read Image
    try:
        content = await file.read()
        image = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file")

    # 2. Run OCR
    width, height = image.size
    ocr_result = reader.readtext(np.array(image))
    
    words = []
    boxes = []
    
    for (bbox, text, prob) in ocr_result:
        # EasyOCR bbox: [[x1,y1], [x2,y1], [x2,y2], [x1,y2]]
        # We need [x1, y1, x2, y2]
        xs = [p[0] for p in bbox]
        ys = [p[1] for p in bbox]
        x1, y1 = min(xs), min(ys)
        x2, y2 = max(xs), max(ys)
        
        normalized_box = normalize_box([x1, y1, x2, y2], width, height)
        words.append(text)
        boxes.append(normalized_box)

    if not words:
        return {"entities": {}, "raw_text": []}

    # 3. Tokenize & Encode
    encoding = processor(
        words,
        boxes=boxes,
        return_tensors="pt",
        truncation=True,
        padding="max_length"
    )

    # 4. Inference
    with torch.no_grad():
        outputs = model(**encoding)
    
    logits = outputs.logits
    predictions = logits.argmax(-1).squeeze().tolist()
    token_boxes = encoding.bbox.squeeze().tolist()
    
    # 5. Decode Entities
    # We need to map tokens back to words or just aggregate neighbor tokens
    # Simple Aggregation Strategy:
    # Group consecutive tokens with same "B-" or "I-" tag.
    
    entities = {
        "total_amount": [],
        "invoice_date": [],
        "vendor_name": [],
        "invoice_id": []
    }
    
    current_entity = None
    current_text = []
    
    # Get word_ids to map subwords back to original words?
    # processor returns word_ids()
    word_ids = encoding.word_ids()
    
    # Helper to clean text
    def clean(tokens):
        return " ".join(tokens).replace(" ##", "") 

    # LayoutLMv3 tokenizer is byte-level BPE, usually roberta-like.
    # It decodes well.
    
    tokens = processor.tokenizer.convert_ids_to_tokens(encoding.input_ids.squeeze())
    
    for idx, (token, label_id) in enumerate(zip(tokens, predictions)):
        if label_id == -100: continue
        if len(ID2LABEL) == 0: break # No labels
        
        label = ID2LABEL.get(label_id, "O")
        
        if label == "O":
            if current_entity: 
                # Close entity
                entities[current_entity].append(clean(current_text))
                current_entity = None
                current_text = []
            continue
            
        # It's B-Tag or I-Tag
        prefix = label[0]
        tag_type = label[2:] # TOTAL, DATE, VENDOR...
        
        # Map tag_type to json key
        key_map = {
            "TOTAL": "total_amount",
            "DATE": "invoice_date",
            "VENDOR": "vendor_name",
            "ID": "invoice_id"
        }
        json_key = key_map.get(tag_type)
        if not json_key: continue

        if prefix == "B":
            # Start new
            if current_entity:
                entities[current_entity].append(clean(current_text))
            current_entity = json_key
            current_text = [token]
        
        elif prefix == "I":
            # Continue (only if same type)
            if current_entity == json_key:
                current_text.append(token)
            else:
                # Mismatch (I-Tag without B-Tag or changed type), treat as new B?
                # Or just ignore
                pass

    # Flush last
    if current_entity:
        entities[current_entity].append(clean(current_text))

    # Clean up lists to single strings (Take first likely candidate)
    final_response = {}
    for k, v in entities.items():
        # Heuristic: Join all parts found? Or just take first?
        # Often parts are fragmented. Join with space.
        final_response[k] = " ".join(v).replace("Ġ", "").strip() # Remove RoBERTa special char

    return {
        "status": "success",
        "data": final_response,
        "debug_raw_ocr": words
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
