# ORC System Overview

**Version:** 7.0 | **Last Updated:** 2026-02-06

---

## Current State: Phase 9.5 Complete

## What We Have

### Core Platform
- **Next.js 15** web app with "Dark Space" glassmorphism theme
- **Agentic Mesh Architecture**: Gatekeeper → Analyst (Self-Correcting) → Guardian
- **Python Extraction Engine**: pdfplumber + Gemini (FastAPI port 8000)
- **Glass Box Philosophy**: Every AI decision is traceable via Grounding Map

### Completed Phases
| Phase | Status | Key Features |
|-------|--------|--------------|
| 1-3. Foundation | ✅ | Core Pipeline, Trust, Communication |
| 5-6. Experience | ✅ | Mobile, UX Flow, WorkflowStepper |
| 7. Engine | ✅ | Python/FastAPI Migration |
| 8. Intelligence | ✅ | Grounding Overlay, Fraud Detection, Gmail OAuth |
| 9. Hyperautomation | ✅ | Agentic Self-Correction Loop |
| 9.5. System Polish | ✅ | Multi-Key Rotation, Restructure (scripts → backend) |

### Current Metrics vs Industry Benchmarks
| Metric | ORC Current | Industry Best |
|--------|-------------|---------------|
| Field Accuracy | **100%** (Golden Set) | 95-99% |
| Processing Time | **3.5s** | <5s |
| STP Rate | **100%** | >80% |

---

## Where We're Going

### Immediate (Phase 11: ML Pivot)
1. **Auto-Labeling Pipeline** — Use Gemini to label Kaggle `batch_1` images → `ground_truth.json`.
2. **Model Training** — Fine-tune LayoutLMv3 on labeled data.
3. **Hybrid Mesh** — Local Model (Tier 1) → Gemini fallback (Tier 2).

### Short-term (Next Sprint)
| Feature | Industry Driver |
|---------|-----------------|
| **Auto-Labeling** | Create Golden Dataset from Kaggle images |
| **Database Migration** | Enterprise data persistence (Prisma + Postgres) |
| **Training UI** | Show "Training Progress" in Frontend |

### Long-term Vision
| Goal | Target |
|------|--------|
| **Field Accuracy** | 99.9% (Six Sigma) |
| **Market Position** | $8.67B Agentic AI supply chain market (2025) |

---

## How We Get There

### Industry Best Practices (2025)
1. **Glass Box Transparency** — Users trust what they can verify (Grounding Map).
2. **Agentic Self-Correction** — AI fixes its own mistakes before human review.
3. **Human-in-the-Loop** — Strategic oversight, not manual entry.

### Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Document Accuracy | 100% | >99% |
| Processing Time | 3.5s | <3s |
| STP Rate | 100% | >90% |

---

## Key References

| Resource | Purpose |
|----------|---------|
| `backend/main.py` | Agentic Orchestrator (FastAPI) |
| `web/app/components/DocumentPreview.tsx` | Glass Box Rendering |
| `docs/ORC_Roadmap.md` | Full development phases |
| `docs/GMAIL_SETUP.md` | OAuth Configuration Guide |
| `docs/ML_STRATEGY.md` | Cognitive Engine Pivot Strategy |

---

## How to Resume Development

1. **Start Backend:**
   ```bash
   cd backend
   python main.py
   ```
2. **Start Frontend:**
   ```bash
   cd web
   npm run dev
   ```
3. **Verify System:**
   - App: `http://localhost:3000/app`
   - API Health: `http://localhost:8000/health`
   - Gmail Status: `http://localhost:8000/gmail/status`

---

> *"One Human. Fifty Agents."* — The future of enterprise software.
