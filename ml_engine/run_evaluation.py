
import os
import torch
import numpy as np
from transformers import LayoutLMv3ForTokenClassification, LayoutLMv3Processor
import evaluate
from dataset import InvoiceDataset
from sklearn.metrics import classification_report

MODEL_DIR = "./models/layoutlmv3-finetuned"
GROUND_TRUTH_DIR = "./ground_truth"

def evaluate_model():
    print(f"📊 Loading Model from {MODEL_DIR}...")
    try:
        model = LayoutLMv3ForTokenClassification.from_pretrained(MODEL_DIR)
        processor = LayoutLMv3Processor.from_pretrained(MODEL_DIR)
    except Exception as e:
        print(f"❌ Model not found or invalid: {e}")
        return

    print(f"📂 Loading Test Data from {GROUND_TRUTH_DIR}...")
    # Ideally use a held-out test set, but for now we use the whole set for 'dry run' eval
    dataset = InvoiceDataset(GROUND_TRUTH_DIR, processor)
    
    print("🔮 Running Inference...")
    model.eval()
    
    predictions = []
    true_labels = []
    
    # Simple loop (slow, but fine for small data)
    for i in range(len(dataset)):
        example = dataset[i]
        
        # Add batch dim
        input_ids = example['input_ids'].unsqueeze(0)
        bbox = example['bbox'].unsqueeze(0)
        attention_mask = example['attention_mask'].unsqueeze(0)
        pixel_values = example['pixel_values'].unsqueeze(0)
        labels = example['labels'].unsqueeze(0)
        
        with torch.no_grad():
            outputs = model(
                input_ids=input_ids,
                bbox=bbox,
                attention_mask=attention_mask,
                pixel_values=pixel_values
            )
            
        logits = outputs.logits
        pred_idx = torch.argmax(logits, dim=2)[0] # First in batch
        
        # Decode
        # We need to map tokens back to words to see if it makes sense, 
        # but for metrics we just need ID/Label match.
        
        # Filter -100 (ignored indices)
        label_ids = labels[0]
        
        filtered_preds = [dataset.id2label[p.item()] for (p, l) in zip(pred_idx, label_ids) if l != -100]
        filtered_labels = [dataset.id2label[l.item()] for (p, l) in zip(pred_idx, label_ids) if l != -100]
        
        predictions.append(filtered_preds)
        true_labels.append(filtered_labels)

    # Metrics
    metric = evaluate.load("seqeval")
    results = metric.compute(predictions=predictions, references=true_labels)
    
    print("\n🏆 Evaluation Results:")
    print(f"Precision: {results['overall_precision']:.4f}")
    print(f"Recall:    {results['overall_recall']:.4f}")
    print(f"F1 Score:  {results['overall_f1']:.4f}")
    print(f"Accuracy:  {results['overall_accuracy']:.4f}")
    
    # Detailed Report
    # Flatten checks? Seqeval gives detailed report per tag.
    print("\nDetailed Metrics:")
    for key in results:
        if isinstance(results[key], dict):
            print(f"{key}: F1={results[key]['f1']:.4f}")

if __name__ == "__main__":
    evaluate_model()
