# ORC System Overview

**Version:** 6.0 | **Last Updated:** 2026-02-06

---

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

### Current Metrics vs Industry Benchmarks
| Metric | ORC Current | Industry Best |
|--------|-------------|---------------|
| Field Accuracy | **100%** (Golden Set) | 95-99% |
| Processing Time | **3.5s** | <5s |
| STP Rate | **100%** | >80% |

---

## Where We're Going

### Immediate (Next Step)
1. **Frontend Integration of Agentic Loop** — Visualize "Analyst Retrying..." events.
2. **Persistent Storage** — Migrate from localStorage/JSON to PostgreSQL.
3. **Real-time Updates** — WebSocket/SSE for streaming logs.

### Short-term (Next Sprint)
| Feature | Industry Driver |
|---------|-----------------|
| **Database Migration** | Enterprise data persistence (Prisma + Postgres) |
| **RPA Connectors** | Integration with legacy ERPs (SAP/Oracle) |
| **Multi-modal Intake** | Voice instructions for edge-case handling |

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
| `scripts/api_server.py` | Agentic Orchestrator (FastAPI) |
| `web/app/components/DocumentPreview.tsx` | Glass Box Rendering |
| `context/ORC_Roadmap.md` | Full development phases |
| `docs/GMAIL_SETUP.md` | OAuth Configuration Guide |

---

## How to Resume Development

1. **Start Backend:**
   ```bash
   cd scripts
   python api_server.py
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
