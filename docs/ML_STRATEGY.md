# Strategic Pivot: ORC as a Cognitive Engine

**Date:** 2026-02-06
**Topic:** Transitioning from "Wrapper" (Gemini-only) to "Cognitive Engine" (Hybrid ML).

---

## 1. The Core Questions

### "Is this still ORC?"
**Yes.** The mission of ORC is *"Decouple complexity from human effort."*
- **Yesterday's ORC:** A smart manager that hires a contractor (Google Gemini) to do the reading.
- **Tomorrow's ORC:** A smart manager that *learned to read* and only calls the contractor for the hardest books.

**Verdict:** It is the *purest* evolution of the orchestration idea. True orchestration optimizes for cost, speed, and accuracy. Owning the model is the ultimate optimization.

### "How far have we diverged?"
We haven't diverged; we have **deepened**.
- **Phase 1-8:** Validated the *Workflow* (UX, Pipeline, Trust). We proved people want this.
- **Phase 9-10:** Validating the *Intelligence*. We are moving from "Renting Intelligence" (API) to "Owning Intelligence" (Weights).

### "Is it for the best?"
**Absolutely.**
- **Defense:** Anyone can build a Gemini wrapper. No one can replicate your fine-tuned model trained on your proprietary corrected data (The Flywheel).
- **Cost:** API calls = $X per doc. Local Model = $0 per doc (electricity).
- **Privacy:** Banks/Hospitals prefer data that never leaves the server (Local ML).

---

## 2. Feasibility & Requirements ("What will it take?")

This is a step up in **Engineering Complexity** but a massive reduction in **Operational Risk**.

### New Tech Stack Additions
| Component | Requirement | Difficulty |
|-----------|-------------|------------|
| **Training Framework** | `PyTorch` / `HuggingFace Transformers` | ⭐⭐⭐ |
| **Model** | `LayoutLMv3` or `Donut` (Pre-trained) | ⭐⭐ |
| **Compute** | NVIDIA GPU (T4/A100) or Google Colab Pro | ⭐⭐ |
| **Serving** | `ONNX Runtime` (CPU inference) | ⭐⭐ |

### The Workflow Change
1.  **Old Way:** PDF → Gemini API → JSON.
2.  **New Way (The Hybrid Mesh):**
    - **Tier 1 (Local ML):** Milliseconds. Free. Handles 80% of standard invoices.
    - **Tier 2 (Gemini):** Fallback for complex/new layouts. Slower. Costs money.
    - **Tier 3 (Human):** The "Teacher". Corrections train Tier 1.

---

## 3. The "Data Flywheel" Opportunity

You mentioned **Kaggle Data**. This is the fuel.
- **Bootstrapping:** We use Kaggle data (CORD/RVL-CDIP) to teach the model what an "Invoice" looks like generally.
- **Fine-tuning:** We use your specific data to teach it what *your* invoices look like.

**Conclusion:** This pivot transforms ORC from a cool "Tool" into a valuable "Asset" (IP). We are building a brain, not just a switchboard.

---

## 4. Free Tier Execution Plan (The Workarounds)

**Can we do this for $0? YES.** But we must be clever.

### A. Training (The "Cloud-Burst" Strategy)
**Problem:** Training requires heavy GPU (which costs $2/hr on cloud).
**Solution:** **Kaggle Kernels** or **Google Colab**.
- **The Hack:** We don't train locally. We upload our training script to Kaggle (where the data is), enable the **Free P100 GPU** (30 hours/week), train for 4 hours, and download the `.pt` model file.
- **Cost:** $0.

### B. Inference (The "Edge-Optimization" Strategy)
**Problem:** Running a massive model locally slows down the PC.
**Solution:** **Quantization & ONNX**.
- **The Hack:** We convert the heavy PyTorch model into "ONNX" format (Open Neural Network Exchange). We "quantize" it (reduce precision from float32 to int8).
- **Result:** It runs lightning fast on a standard CPU (Laptop). No GPU required for runtime.
- **Cost:** $0.

### C. Hosting (The "HuggingFace" Strategy)
**Problem:** Model files are huge (500MB+).
**Solution:** **HuggingFace Hub**.
- **The Hack:** We host our private fine-tuned models on HuggingFace for free. Our app downloads them once on startup.
- **Cost:** $0.

