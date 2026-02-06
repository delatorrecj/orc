# ORC: Product Roadmap

**Version:** 3.0 | **Last Updated:** 2026-02-06
**Mission:** Build an industry-grade Agentic Intake Layer achieving 98% accuracy and 85% STP rate.

---

## Current Status: Phase 9.5 Complete ✅

| Phase | Status | Highlights |
|-------|--------|------------|
| 1. Pipeline | ✅ | 3-agent system, line item extraction |
| 2. Trust | ✅ | HITL approval, PII detection, audit |
| 3. Communication | ✅ | AI email drafting, templates |
| 5. Frontend | ✅ | Mobile, SEO, accessibility |
| 6. UX | ✅ | WorkflowStepper, phase-based flow |
| 7. Python Engine | ✅ | pdfplumber + Gemini FastAPI |
| 8. Intelligence | ✅ | Grounding, Fraud Detection, batch testing |
| 9. Hyperautomation | ✅ | Agentic Self-Correction Loop |
| 9.5. System Polish | ✅ | Multi-Key Rotation, Restructure (`scripts/` → `backend/`) |

**Current Metrics:** 100% accuracy (dataset), 3.5s processing, 100% STP

---

## Phase 8: Intelligence Layer (Core Complete ✅)

**Target:** 95% accuracy, <5s processing, 80% STP

| Feature | Priority | Status | Industry Benchmark |
|---------|----------|--------|-------------------|
| Grounding Map | P0 | ✅ | Visual proof of extraction source |
| Gmail API Integration | P0 | ✅ | Auto-ingest (70% labor reduction) |
| Fraud Detection | P1 | ✅ | Round number + variance alerts |
| Batch Golden Dataset Test | P1 | ✅ | Validate 95%+ accuracy |

---

## Phase 9: Hyperautomation (Core Complete ✅)

**Target:** 98% accuracy, <3s processing, 85% STP

| Feature | Priority | Status | ROI Impact |
|---------|----------|--------|------------|
| Agentic AI Mesh | P0 | ✅ | Multi-agent collaboration |
| Self-Correction Loop | P0 | ✅ | Auto-retry with error feedback |
| Multi-Key Rotation | P1 | ✅ | Rate limit bypass (3 keys) |

---

## Phase 10: Event-Driven Agentic Mesh (Planning)
*(No changes)*

---

## Phase 11: Zero-Cost Intelligence (Current Focus 🚀)

**Target:** Drastically reduce inference cost by offloading extraction to local models (LayoutLMv3).

| Feature | Priority | Status | Significance |
|---------|----------|--------|--------------|
| **Data Foundry** | P0 | ✅ | Auto-Labeling Pipeline (Kaggle -> JSON) |
| **Model Training Infra** | P0 | 🏃‍♂️ | `train.py` (LayoutLMv3 + EasyOCR) |
| **Local Inference API** | P1 | �️ | Serve model via `fastapi` |
| **Deploy to HF Spaces** | P1 | 🔲 | **Free Hosting** for Model (vs Railway) |
| **Hybrid Routing** | P1 | 🔲 | Router: Gemini (Complex) vs Local (Simple) |

---

## Phase 12: Enterprise Integrations & Scale (Backlog 🔲)

| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| **Vector DB (Vertex AI)** | P1 | 🔲 | From Phase 8 (Benchmark comparison) |
| **RPA Integration** | P1 | 🔲 | From Phase 9 (UiPath/Zapier) |
| **ERP Connectors** | P2 | 🔲 | NetSuite, SAP, Oracle |
| **Legal Pages** | P2 | 🔲 | Privacy Policy, Terms of Service |
| **Dark/Light Mode** | P3 | 🔲 | UI Polish |
| **MagicBento Rollout** | P2 | 🔲 | Advanced UI Components | 
| **ONNX Quantization** | P1 | 🔲 | Optimization for CPU Inference |

---

## Success Targets

| Metric | Current | Phase 8 | Phase 9 |
|--------|---------|---------|---------|
| Field Accuracy | 90% | 95% | **98%** |
| Processing Time | 8s | 5s | **<3s** |
| STP Rate | 70% | 80% | **85%** |
| Human Intervention | 25% | 15% | **<10%** |

---

## Guiding Principles

1. **Glass Box** — Every AI decision traceable
2. **Human-in-the-Loop** — HITL for low-confidence extractions
3. **Scale by Pattern** — Replicate successful automation flows
4. **Data Quality First** — Start bounded, expand iteratively

---

> *"Orchestration. Resilience. Compliance."*
