import os
import torch
from transformers import (
    LayoutLMv3ForTokenClassification, 
    LayoutLMv3Processor, 
    TrainingArguments, 
    Trainer
)
from dataset import InvoiceDataset

def train():
    # 1. Config
    MODEL_ID = "microsoft/layoutlmv3-base"
    DATA_DIR = "ml_engine/ground_truth"
    OUTPUT_DIR = "ml_engine/models/layoutlmv3-finetuned"
    
    # 2. Prepare Data
    print(f"Loading data from {DATA_DIR}...")
    processor = LayoutLMv3Processor.from_pretrained(MODEL_ID, apply_ocr=True)
    
    # We use a custom collator or rely on standard if dataset returns everything padded.
    # For LayoutLMv3, we usually need dynamic padding, but 'dataset.py' pads to max_length.
    train_dataset = InvoiceDataset(DATA_DIR, processor=processor)
    
    if len(train_dataset) == 0:
        print("No valid data found (images + labels). check Data Foundry output.")
        return

    # 3. Model
    # Determine number of labels from dataset (placeholder logic)
    # in reality, this comes from the defined schema (TOTAL, DATE, VENDOR, etc.)
    label_list = ["O", "B-TOTAL", "I-TOTAL", "B-DATE", "I-DATE", "B-VENDOR", "I-VENDOR"]
    id2label = {i: l for i, l in enumerate(label_list)}
    label2id = {l: i for i, l in enumerate(label_list)}
    
    model = LayoutLMv3ForTokenClassification.from_pretrained(
        MODEL_ID,
        num_labels=len(label_list),
        id2label=id2label,
        label2id=label2id
    )

    # 4. Training Arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        max_steps=100, # Demo steps
        per_device_train_batch_size=2,
        learning_rate=1e-5,
        save_steps=50,
        logging_steps=10,
        remove_unused_columns=False, # Necessary for custom datasets with extra fields
        report_to="none"
    )

    # 5. Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        tokenizer=processor.tokenizer,
        # data_collator=default_data_collator, 
    )

    # 6. Train
    print("Starting training...")
    try:
        trainer.train()
        print(f"Training complete. Model saved to {OUTPUT_DIR}")
    except Exception as e:
        print(f"Training failed: {e}")
        print("Tip: Ensure you have labels aligned in your dataset.py")

if __name__ == "__main__":
    train()
