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

        # 3. Process (Manual Tokenization & Alignment)
        encoded_inputs = self.processor.tokenizer(
            words,
            boxes=boxes,
            padding=False,
            truncation=True,
            max_length=self.max_length,
            return_offsets_mapping=True,
            is_split_into_words=True
        )
        
        # Now we match labels.
        word_ids = encoded_inputs.word_ids()
        label_ids = []
        previous_word_idx = None
        
        for word_idx in word_ids:
            if word_idx is None:
                label_ids.append(-100) # Special token
            elif word_idx != previous_word_idx:
                # First token of word
                lbl = ner_tags[word_idx]
                label_ids.append(self.label2id.get(lbl, 0)) # B-Tag or O
            else:
                # Subsequent token -> needs to be I-Tag if B-Tag
                lbl = ner_tags[word_idx]
                if lbl.startswith("B-"):
                    i_lbl = "I-" + lbl[2:]
                    label_ids.append(self.label2id.get(i_lbl, 0)) # I-Tag
                else:
                    label_ids.append(self.label2id.get(lbl, 0)) # O stays O
                
            previous_word_idx = word_idx

        # Convert to tensors and Pad
        # We reuse processor to pad? No, processor.pad works on dict of lists.
        # Or just manual torch padding.
        
        # Prepare Dict for padding
        item = {
            "input_ids": encoded_inputs["input_ids"],
            "bbox": encoded_inputs["bbox"],
            "attention_mask": encoded_inputs["attention_mask"],
            "labels": label_ids,
            "pixel_values": self.processor.image_processor(image, return_tensors="pt").pixel_values.squeeze()
        }
        
        # Pad inputs (except pixel_values)
        padding_length = self.max_length - len(item["input_ids"])
        if padding_length > 0:
            item["input_ids"] = item["input_ids"] + [self.processor.tokenizer.pad_token_id] * padding_length
            item["attention_mask"] = item["attention_mask"] + [0] * padding_length
            item["bbox"] = item["bbox"] + [[0,0,0,0]] * padding_length
            item["labels"] = item["labels"] + [-100] * padding_length
        else:
            # Truncate (Tokenizer might have done it, but labels/bbox need to match)
            # Tokenizer truncation handles ids/bbox/mask. We need to truncate labels.
            max_len = self.max_length
            item["input_ids"] = item["input_ids"][:max_len]
            item["attention_mask"] = item["attention_mask"][:max_len]
            item["bbox"] = item["bbox"][:max_len]
            item["labels"] = item["labels"][:max_len]

        # Convert to Tensors
        final_encoding = {
            "input_ids": torch.tensor(item["input_ids"], dtype=torch.long),
            "bbox": torch.tensor(item["bbox"], dtype=torch.long),
            "attention_mask": torch.tensor(item["attention_mask"], dtype=torch.long),
            "labels": torch.tensor(item["labels"], dtype=torch.long),
            "pixel_values": item["pixel_values"]
        }
            
        return final_encoding
