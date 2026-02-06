import json
import os
from PIL import Image
import torch
from torch.utils.data import Dataset
from transformers import LayoutLMv3Processor

class InvoiceDataset(Dataset):
    def __init__(self, data_dir, processor=None, max_length=512):
        """
        Args:
            data_dir (str): Path to directory containing images and .json labels
            processor (LayoutLMv3Processor): Hugging Face processor
            max_length (int): Max token length
        """
        self.data_dir = data_dir
        self.processor = processor or LayoutLMv3Processor.from_pretrained("microsoft/layoutlmv3-base")
        self.max_length = max_length
        
        # Filter for valid pairs (image + json)
        self.files = []
        all_files = os.listdir(data_dir)
        for f in all_files:
            if f.endswith(".json") and not f.startswith("_"):
                base_name = os.path.splitext(f)[0]
                # check for corresponding image (jpg or png)
                if f"{base_name}.jpg" in all_files:
                    self.files.append(base_name)
                elif f"{base_name}.png" in all_files:
                    self.files.append(base_name)

        # Schema Definition (BIO Scheme)
        self.label_list = [
            "O", 
            "B-TOTAL", "I-TOTAL", 
            "B-ID", "I-ID", 
            "B-DATE", "I-DATE", 
            "B-VENDOR", "I-VENDOR"
        ]
        self.label2id = {l: i for i, l in enumerate(self.label_list)}
        self.id2label = {i: l for i, l in enumerate(self.label_list)}

        print(f"Indices found: {len(self.files)} valid pairs in {data_dir}")

    def __len__(self):
        return len(self.files)

    def __getitem__(self, idx):
        base_name = self.files[idx]
        
        # Load Image
        img_path = os.path.join(self.data_dir, f"{base_name}.jpg")
        if not os.path.exists(img_path):
             img_path = os.path.join(self.data_dir, f"{base_name}.png")
        
        image = Image.open(img_path).convert("RGB")
        
        # Load Labels
        json_path = os.path.join(self.data_dir, f"{base_name}.json")
        with open(json_path, "r") as f:
            label_data = json.load(f)

        # 1. Run OCR via Processor (apply_ocr=True is default for images if words not provided)
        # We process image first to get words/boxes, then align tags.
        # Note: This is inefficient (double processing) but easiest for implementation.
        # Better: use pytesseract directly, but let's stick to processor API if possible.
        
        # Actually, `processor` with image returns `encoding` which matches `words` internally?
        # LayoutLMv3Processor returns `input_ids`, `bbox`, `attention_mask`, `pixel_values`.
        # It does NOT return the raw `words` unless we ask or inspect it.
        # We need the words to match labels.
        
        # So we MUST run OCR manually.
        # We use EasyOCR since Tesseract might be missing.
        import easyocr
        import numpy as np

        # Initialize reader once (or cache it nicely? For now, re-init per call is slow but safe)
        # Better: Initialize in __init__
        if not hasattr(self, 'reader'):
             self.reader = easyocr.Reader(['en'], verbose=False) # GPU if available

        try:
             # EasyOCR returns [(bbox, text, prob), ...]
             # bbox is [[x1,y1], [x2,y1], [x2,y2], [x1,y2]]
             results = self.reader.readtext(np.array(image))
             
             words = []
             boxes = []
             width, height = image.size
             
             for (bbox, text, prob) in results:
                 # Convert polygon to xyxy
                 # bbox is list of 4 points
                 xs = [p[0] for p in bbox]
                 ys = [p[1] for p in bbox]
                 x1 = int(min(xs))
                 y1 = int(min(ys))
                 x2 = int(max(xs))
                 y2 = int(max(ys))
                 
                 # Normalize 0-1000
                 x1 = max(0, min(1000, int((x1 / width) * 1000)))
                 y1 = max(0, min(1000, int((y1 / height) * 1000)))
                 x2 = max(0, min(1000, int((x2 / width) * 1000)))
                 y2 = max(0, min(1000, int((y2 / height) * 1000)))
                 
                 words.append(text)
                 boxes.append([x1, y1, x2, y2])
                 
        except Exception as e:
            print(f"OCR Failed for {base_name}: {e}")
            words = ["Empty"]
            boxes = [[0,0,0,0]]

        # 2. Align Labels (Heuristic)
        # Schema: total_amount, invoice_id, invoice_date, vendor_name
        # We try to find exact string matches in `words`.
        
        ner_tags = ["O"] * len(words)
        
        # Helper to normalize for matching
        def normalize(s):
            return str(s).lower().replace("$", "").replace(",", "").strip()

        target_map = {
            "total_amount": "TOTAL",
            "invoice_id": "ID",
            "invoice_date": "DATE",
            "vendor_name": "VENDOR"
        }

        for key, tag in target_map.items():
            if key in label_data:
                target_val = normalize(label_data[key])
                if not target_val: continue
                
                # Search in words (Exact Match)
                for i, w in enumerate(words):
                    if normalize(w) == target_val:
                        ner_tags[i] = f"B-{tag}" # Mark start of entity
                        # TODO: Multi-word entities (e.g. "Vendor Name Inc") not handled here yet.
                        # This logic assumes entity is contained in one OCR block.

        # 3. Process (Auto-Alignment via Processor)
        word_labels = [self.label2id.get(tag, 0) for tag in ner_tags]
        
        encoding = self.processor(
            image,
            words,
            boxes=boxes,
            word_labels=word_labels,
            truncation=True,
            padding="max_length",
            max_length=self.max_length,
            stride=128,
            return_overflowing_tokens=True,
            return_offsets_mapping=True,
            return_tensors="pt"
        )
        
        # 4. Extract first window (LayoutLMv3 is usually handled this way for simple training)
        return {
            "input_ids": torch.tensor(encoding["input_ids"][0], dtype=torch.long),
            "attention_mask": torch.tensor(encoding["attention_mask"][0], dtype=torch.long),
            "bbox": torch.tensor(encoding["bbox"][0], dtype=torch.long),
            "pixel_values": encoding["pixel_values"][0], # Already tensor
            "labels": torch.tensor(encoding["labels"][0], dtype=torch.long)
        }
