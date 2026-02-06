# ORC System Overview

**Version:** 5.0 | **Last Updated:** 2026-02-06

---

## What We Have

### Core Platform
- **Next.js 15** web app with "Dark Space" glassmorphism theme
- **3-Agent Pipeline**: Gatekeeper → Analyst → Guardian
- **Python Extraction Engine**: pdfplumber + Gemini (FastAPI port 8000)
- **Glass Box Philosophy**: Every AI decision is traceable

### Completed Phases
| Phase | Status | Key Features |
|-------|--------|--------------|
| 1. Pipeline | ✅ | Classification, line item extraction, math validation |
| 2. Trust | ✅ | Human approval, PII detection, audit logs |
| 3. Communication | ✅ | AI email drafting, templates, copy-to-clipboard |
| 5. Frontend | ✅ | Mobile responsive, SEO, accessibility |
| 6. UX | ✅ | WorkflowStepper, ModeSelector, phase-based flow |
| 7. Python | ✅ | pdfplumber extraction, header mapping, FastAPI |

### Current Metrics vs Industry Benchmarks
| Metric | ORC Current | Industry Best |
|--------|-------------|---------------|
| Field Accuracy | ~90% | 95-99% |
| Processing Time | ~8s | <5s |
| STP Rate | ~70% | 80% |

---

## Where We're Going

### Immediate (This Session)
1. **Grounding Map** — PDF bounding box coordinates for extracted values
2. **Gmail API** — Auto-ingest invoices from inbox (OAuth2)
3. **Vector DB + Fraud** — Anomaly detection, benchmark comparison

### Short-term (Next Sprint)
| Feature | Industry Driver |
|---------|-----------------|
| **Agentic AI Mesh** | Multiple agents collaborating autonomously |
| **PostgreSQL + Prisma** | Enterprise data persistence |
| **Real-time Processing** | Edge computing for <3s latency |
| **Hyperautomation** | RPA + AI + Workflows for end-to-end automation |

### Long-term Vision
| Goal | Target |
|------|--------|
| **Field Accuracy** | 98%+ (GPT-4 benchmark level) |
| **STP Rate** | 85%+ (minimal human intervention) |
| **Multi-modal AI** | Text + Image + Voice pipeline |
| **Market Position** | $8.67B Agentic AI supply chain market (2025) |

---

## How We Get There

### Industry Best Practices (2025)

1. **Human-in-the-Loop (HITL)**
   - Maintain human oversight for low-confidence extractions
   - Build trust through explainable decisions ✅ Already implemented

2. **Agentic AI Architecture**
   - Agents that reason, collaborate, and act autonomously
   - "Agentic AI Mesh" for multi-agent orchestration
   - 330-400% ROI within 24 months (industry benchmark)

3. **Hyperautomation**
   - Combine RPA + AI + advanced workflows
   - 70% labor reduction in invoice processing
   - 60% faster contract review cycles

4. **Data Quality First**
   - Start with bounded problems with clear metrics
   - Scale by pattern (replicate successful flows)

5. **Security & Compliance**
   - SOC 2, GDPR compliance
   - Audit trails, version control, explainable decisions ✅ Implemented

### Technical Roadmap

| Priority | Feature | Approach |
|----------|---------|----------|
| P0 | Grounding Map | pdfplumber char-level bbox extraction |
| P0 | Gmail API | OAuth2 + inbox polling for attachments |
| P0 | Vector DB | Vertex AI Matching Engine for benchmarks |
| P1 | Fraud Detection | Round number bias + price variance alerts |
| P1 | Agentic Mesh | Multi-agent collaboration framework |
| P2 | Real-time Processing | Edge compute, WebSocket streaming |
| P2 | Multi-tenant SaaS | PostgreSQL + auth + tenant isolation |

### Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Document Accuracy | >90% | >98% |
| Processing Time | 8s | <3s |
| STP Rate | 70% | 85% |
| Human Intervention | 25% | <10% |

---

## Key References

| Resource | Purpose |
|----------|---------|
| `orc_prompt_engine.json` | AI agent prompts |
| `scripts/api_server.py` | Python extraction API |
| `hooks/useOrchestrator.ts` | Frontend orchestration |
| `context/ORC_Roadmap.md` | Full development phases |

---

> *"One Human. Fifty Agents."* — The future of enterprise software.
