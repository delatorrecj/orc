# ORC Session Resume

**Last Session:** 2026-02-06
**Phase Completed:** Phase 9 (Agentic AI Mesh)
**Next Phase:** Phase 11 (Proprietary Cognitive Engine)

## 🛑 System State
- **Architecture:** Agentic Loop (Analyst → Guardian → Retry).
- **Data:** Kaggle Datasets uploaded (`c:\Users\delat\Downloads\kaggle_datasets`).
- **Feature:** "Self-Correction" is live but needs a frontend UI update.

## ⚠️ Critical Data Findings
- **Mismatch:** The `invoices.csv` (synthetic people) does **NOT** match `batch_1` (scanned invoices).
- **Solution:** We cannot use the CSV for training. We must use the **ORC Agent (Gemini)** to "Auto-Label" the images in `batch_1` to create our own `ground_truth.json`.

## 🚀 Next Steps (The "ML Pivot")
1.  **Auto-Labeling Job:** Write a script to iterate through `batch_1`, send to Gemini, and save JSONs.
    - *Goal:* Create 100 labeled samples for the "Golden Dataset".
2.  **Training Pipeline:** Set up `train.py` to fine-tune LayoutLMv3 on this new Golden Dataset.
3.  **Free Tier Execution:** Upload the script to Kaggle Kernels for free GPU training.

## 📝 Pending Tasks
1.  [ ] Create `scripts/auto_labeler.py`.
2.  [ ] Update Frontend to show "Training Progress".
