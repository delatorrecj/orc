# ORC System Overview

**Version:** 8.0 | **Last Updated:** 2026-02-06
**Context:** Enterprise Supply Chain Orchestration

---

## What We Have (The "Glass Box")

We have built an **Industry-Grade Agentic Foundation** that is currently live.

### 1. Active Infrastructure
-   **Frontend:** Next.js 16 (App Router) on **Vercel** (`frontend/`).
-   **Backend:** FastAPI (Python) on **Railway** (`backend/`).
-   **Communication:** Webpack-optimized build (Turbopack disabled for stability).

### 2. The Agentic Mesh
-   **Gatekeeper:** Vision-based document classification.
-   **Analyst:** Self-correcting extraction engine (Gemini Flash 2.5).
-   **Guardian:** Rules-based logic for fraud detection & compliance.

### 3. Metric achievements
| Metric | ORC Current | Industry Standard |
| :--- | :--- | :--- |
| **Accuracy** | **100%** (Golden Set) | 95% |
| **Speed** | **3.5s** | <5s |
| **Throughput** | **100% STP** | 80% |

---

## Where We're Going (The "Brain")

We are pivoting from pure API calls to a **Hybrid Cognitive Engine**.

### 1. Phase 11: The "Data Foundry"
We discovered the Kaggle dataset contains raw images but lacks ground truth.
-   **Strategy:** Build an automatic "Data Foundry".
-   **Pipeline:** Ingest Raw Images -> Auto-Label (Gemini) -> Train Local Model.
-   **Status:** Auto-Labeler V1 is active (Rate-limit aware).

### 2. Phase 12: Proprietary Cognitive Engine
-   **Goal:** Zero-Cost Inference & 24/7 Availability.
-   **Tech:** Fine-tuned `LayoutLMv3` + CPU-Only Inference.
-   **Architecture:**
    -   **Training:** Google Colab (Free Tier GPU).
    -   **Hosting:** Hugging Face Hub (Model Weights).
    -   **Serving:** Railway (CPU Container) loads model from HF Hub.
    -   **Hybrid Routing:** `useOrchestrator` tries Local -> Falls back to Cloud.

---

## How We Get There (The Roadmap)

### Short Term: The "Factory"
1.  **Ingest:** Process Kaggle `batch_1` through the Auto-Labeler.
2.  **Train:** Establish `ml_engine/train.py` infrastructure.
3.  **Iterate:** Use Active Learning to improve the model.

### Long Term: Enterprise Scale
-   **Vector DB:** For historical vendor memory.
-   **RPA/ERP Connectors:** "Hands" to execute actions in NetSuite/SAP.

---

## Key References
| Resource | Purpose |
| :--- | :--- |
| `backend/main.py` | Agentic Orchestrator (FastAPI) |
| `frontend/app/` | Next.js Application Source |
| `docs/ORC_Roadmap.md` | Detailed Phase Tracking |
| `docs/walkthrough.md` | Testing Guide |

> *"One Human. Fifty Agents."*
