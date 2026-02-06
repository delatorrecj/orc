
import os
import torch
import numpy as np
from transformers import (
    LayoutLMv3ForTokenClassification,
    LayoutLMv3Processor,
    TrainingArguments,
    Trainer,
    EarlyStoppingCallback,
    default_data_collator
)
import evaluate

from sklearn.model_selection import train_test_split
from dataset import InvoiceDataset

# Configuration
MODEL_NAME = "microsoft/layoutlmv3-base"
OUTPUT_DIR = "./ml_engine/models/layoutlmv3-finetuned"
GROUND_TRUTH_DIR = "./ml_engine/ground_truth"
BATCH_SIZE = 2
LEARNING_RATE = 5e-5
NUM_EPOCHS = 10
MAX_STEPS = 1000  # Cap valid steps (optional)

def compute_metrics(p):
    metric = evaluate.load("seqeval")
    predictions, labels = p
    predictions = np.argmax(predictions, axis=2)

    # Remove ignored index (special tokens)
    true_predictions = [
        [dataset.id2label[p] for (p, l) in zip(prediction, label) if l != -100]
        for prediction, label in zip(predictions, labels)
    ]
    true_labels = [
        [dataset.id2label[l] for (p, l) in zip(prediction, label) if l != -100]
        for prediction, label in zip(predictions, labels)
    ]

    results = metric.compute(predictions=true_predictions, references=true_labels)
    return {
        "precision": results["overall_precision"],
        "recall": results["overall_recall"],
        "f1": results["overall_f1"],
        "accuracy": results["overall_accuracy"],
    }

def main():
    print("🚀 Initializing Training Pipeline...")
    
    # 1. Initialize Processor & Model
    processor = LayoutLMv3Processor.from_pretrained(MODEL_NAME, apply_ocr=False) # We provide OCR data
    
    # 2. Load Dataset
    print(f"📂 Loading data from {GROUND_TRUTH_DIR}...")
    full_dataset = InvoiceDataset(GROUND_TRUTH_DIR, processor)
    
    # Label Maps
    label_list = list(full_dataset.label2id.keys())
    num_labels = len(label_list)
    print(f"✅ Found {len(full_dataset)} samples with {num_labels} labels: {label_list}")
    
    if len(full_dataset) < 10:
        print("⚠️ Not enough data to split. Using full set for training (OVERFITTING WARNING).")
        train_dataset = full_dataset
        eval_dataset = full_dataset # Cheat for dry run
    else:
        # Split indices
        indices = list(range(len(full_dataset)))
        train_idx, eval_idx = train_test_split(indices, test_size=0.2, random_state=42)
        
        train_dataset = torch.utils.data.Subset(full_dataset, train_idx)
        eval_dataset = torch.utils.data.Subset(full_dataset, eval_idx)
        print(f"📊 Split: Train ({len(train_dataset)}) | Val ({len(eval_dataset)})")

    # 3. Model
    model = LayoutLMv3ForTokenClassification.from_pretrained(
        MODEL_NAME,
        num_labels=num_labels,
        id2label=full_dataset.id2label,
        label2id=full_dataset.label2id
    )

    # 4. Training Arguments
    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        max_steps=MAX_STEPS,
        per_device_train_batch_size=BATCH_SIZE,
        per_device_eval_batch_size=BATCH_SIZE,
        learning_rate=LEARNING_RATE,
        eval_strategy="steps",
        eval_steps=50,
        save_steps=50,
        logging_steps=10,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        push_to_hub=False,
        report_to="tensorboard",
        remove_unused_columns=False, # Required for LayoutLMv3 custom collator behavior
        fp16=torch.cuda.is_available(),
    )

    # 5. Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        data_collator=default_data_collator,
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=2)]
    )

    # 6. Train
    print("🔥 Starting Training...")
    trainer.train()
    
    # 7. Save
    print("💾 Saving Model...")
    trainer.save_model(OUTPUT_DIR)
    processor.save_pretrained(OUTPUT_DIR)
    print("✅ Done!")

if __name__ == "__main__":
    main()
