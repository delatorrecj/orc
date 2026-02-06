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
            data = json.load(f)
            
        # TODO: Implement complex label mapping here if we have bounding boxes.
        # For now, we assume the JSON contains a 'text' and 'bbox' field or similar from OCR.
        # If the auto-labeler output is just key-values (e.g. {"total": "100"}), 
        # we strictly need OCR to map these back to positions.
        
        # CRITICAL NOTE: The current Auto-Labeler output might NOT have bounding boxes 
        # unless Gemini returned them. 
        # If Gemini didn't return bboxes, we need to run a quick Tesseract pass here.
        # For this implementation, we will act as if 'words' and 'boxes' exist or run basic OCR.
        
        # Placeholder for OCR (since Gemini Vision is E2E and might not give coordinates)
        # We use TesseractWrapper or similar ideally. 
        # For the sake of the script, we'll try to use the processor's own OCR if enabled.
        
        encoding = self.processor(
            image,
            return_tensors="pt",
            truncation=True,
            max_length=self.max_length,
            padding="max_length"
        )
        
        # Remove batch dimension
        for k, v in encoding.items():
            encoding[k] = v.squeeze()
            
        return encoding
