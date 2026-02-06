
import os
import torch
from transformers import LayoutLMv3ForTokenClassification, LayoutLMv3Processor
from optimum.onnxruntime import ORTModelForTokenClassification
from optimum.onnxruntime.configuration import AutoQuantizationConfig
from optimum.onnxruntime import ORTQuantizer

# Paths
MODEL_DIR = "./ml_engine/models/layoutlmv3-finetuned"
ONNX_DIR = "./ml_engine/models/onnx"

def quantize_model():
    print(f"🚀 Starting ONNX Quantization for {MODEL_DIR}...")
    
    if not os.path.exists(MODEL_DIR):
        print(f"❌ Model directory {MODEL_DIR} does not exist. Train first!")
        return

    # 1. Export to ONNX
    print("📦 Exporting to ONNX...")
    try:
        # Load model and processor
        model = ORTModelForTokenClassification.from_pretrained(MODEL_DIR, export=True)
        processor = LayoutLMv3Processor.from_pretrained(MODEL_DIR)
        
        # Save ONNX model
        model.save_pretrained(ONNX_DIR)
        processor.save_pretrained(ONNX_DIR)
        print(f"✅ ONNX Model exported to {ONNX_DIR}")
        
    except Exception as e:
        print(f"❌ ONNX Export failed: {e}")
        return

    # 2. Quantize (Dynamic Quantization for CPU)
    print("📉 Quantizing (Float32 -> Int8)...")
    try:
        quantizer = ORTQuantizer.from_pretrained(ONNX_DIR, file_name="model.onnx")
        qconfig = AutoQuantizationConfig.avx512_vnni(is_static=False, per_channel=False)
        
        quantizer.quantize(
            save_dir=ONNX_DIR,
            quantization_config=qconfig,
        )
        print(f"✅ Quantized Model saved to {ONNX_DIR}/model_quantized.onnx")
        
    except Exception as e:
        print(f"❌ Quantization failed: {e}")

if __name__ == "__main__":
    # Ensure optimum is installed: pip install optimum[onnxruntime]
    quantize_model()
