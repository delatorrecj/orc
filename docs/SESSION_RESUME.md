# ORC Session Resume

**Last Session:** 2026-02-07
**Phase Completed:** Phase 11 (Zero-Cost Intelligence & Cloud Deployment)
**Next Phase:** Phase 12.1 (ONNX Optimization)

## 🛑 System State: Hybrid Architecture (ACTIVE)
-   **Hosting:** Railway (Python Service) running `ml_engine/serve.py`.
-   **Model Source:** Hugging Face Hub (`delatorrecj/orc-invoice-v1`).
-   **Configuration:** `HF_MODEL_ID` env var triggers runtime download.
-   **Build:** Optimized `torch-cpu` build (<2GB image) avoids Railway memory limits.
-   **Training:** Moved to Google Colab (Free GPU) -> Upload to HF.

## ⚠️ Critical Configuration
-   **Procfile:** Points to `ml_engine/serve.py`.
-   **requirements.txt:** Locked to `torch==2.1.2+cpu` with `--extra-index-url`. **DO NOT CHANGE** without testing Docker build size.
-   **Secrets:** API Keys verified and rotated. `HF_TOKEN` stored in Colab (not repo).

## 🚀 Next Steps (Phase 12)
1.  **ONNX Quantization:** Run `quantize.py` to compress model to <150MB for 4x faster inference.
2.  **Vector DB:** Benchmark Vertex AI vs. Local FAISS for RAG.
3.  **UI Polish:** Add "Training Mode" indicator to Frontend.

## 📝 Pending Tasks
1.  [ ] Run `ml_engine/quantize.py` and upload `model_quantized.onnx`.
2.  [ ] Update `serve.py` to use `ORTModelForTokenClassification`.
