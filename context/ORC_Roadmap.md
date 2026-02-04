# ORC: Product Roadmap

**Version:** 1.0 (Enterprise Production)
**Mission:** Build an industry-grade Agentic Intake Layer that solves the billion-dollar supply chain viability crisis.

---

## Phase 1: Core Pipeline Hardening
**Status:** In Progress
**Goal:** Establish a robust, production-ready document processing pipeline.

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Document Classification (Gatekeeper) | Critical | ✅ Complete | Identify document type (Invoice, PO, etc.) |
| Data Extraction (Analyst) | Critical | ✅ Complete | Extract line items, totals, dates |
| Compliance Validation (Guardian) | Critical | ✅ Complete | PII, math, fraud checks |
| Prompt Engine Architecture | High | ✅ Complete | Centralized `orc_prompt_engine.json` |
| Error Surfacing & Logging | High | ✅ Complete | Real-time Activity Feed |
| **Line Items Display** | High | 🔲 Pending | Expandable UI showing extracted SKUs, quantities, prices |
| **Extraction Results Export** | Medium | 🔲 Pending | Download as JSON/CSV button |

---

## Phase 2: Trust & Auditability
**Status:** Not Started
**Goal:** Enable enterprise-grade audit trails and human oversight.

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| **Grounding Map** | Critical | 🔲 Pending | PDF page + bounding box coordinates for every extracted value |
| **Verification Card UI** | Critical | 🔲 Pending | Side-by-side PDF viewer with extracted data overlay |
| **Human Approval Flow** | Critical | 🔲 Pending | Accept/Review/Reject buttons for flagged documents |
| **PII Redaction Layer** | High | 🔲 Pending | Cloud DLP integration before data persistence |
| Confidence Threshold Enforcement | High | 🔲 Pending | Block automation if confidence < 85% |
| Audit Log Database | Medium | 🔲 Pending | PostgreSQL table for all agent decisions |

---

## Phase 3: Communication Layer (Module A)
**Status:** Not Started
**Goal:** Autonomous supplier outreach and response monitoring.

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| **Email Intake Agent** | Critical | 🔲 Pending | Gmail API integration for sending/receiving |
| Supplier Sentiment History | High | 🔲 Pending | Track response patterns per vendor |
| Personalized Email Drafting | High | 🔲 Pending | Gemini-powered negotiation prompts |
| Communication Log Artifact | Medium | 🔲 Pending | Show email drafts for human approval |
| Auto-Follow-Up Scheduler | Medium | 🔲 Pending | Escalation logic for non-responders |

---

## Phase 4: Intelligence Layer
**Status:** Not Started
**Goal:** Contextual benchmarking and anomaly detection.

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| **Vector DB Setup** | Critical | 🔲 Pending | Vertex AI Vector Search for benchmarks |
| Golden Standard Database | High | 🔲 Pending | Industry averages (kWh/revenue, etc.) |
| **Variance Check Engine** | High | 🔲 Pending | Flag values >20% from historical average |
| **Fraud Detection (Round Number Bias)** | High | 🔲 Pending | Detect suspiciously round values |
| Region-Based Risk Scoring | Medium | 🔲 Pending | Ethical sourcing checks |

---

## Phase 5: Frontend Polish
**Status:** Not Started
**Goal:** Production-ready user experience, SEO, and marketing assets.

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| **Mobile Responsiveness** | Critical | 🔲 Pending | All pages optimized for tablet/mobile |
| **SEO Optimization** | Critical | 🔲 Pending | Meta tags, OG images, structured data |
| **Schema.org Metadata** | High | 🔲 Pending | BusinessModel, SoftwareApplication entities |
| Performance Optimization | High | 🔲 Pending | Lighthouse score > 90 |
| **Marketing Landing Copy** | High | 🔲 Pending | Finalize homepage value propositions |
| **OG Image Generation** | Medium | 🔲 Pending | Dynamic social share images |
| Accessibility (A11y) Audit | Medium | 🔲 Pending | WCAG 2.1 AA compliance |
| Animation Polish | Low | 🔲 Pending | Micro-interactions and transitions |
| Dark/Light Mode Toggle | Low | 🔲 Pending | Theme switcher (optional) |

---

## Development Principles

1. **No Black Boxes:** Every AI decision must be traceable.
2. **Human-in-the-Loop:** Critical decisions require human approval.
3. **Google AI Principles:** Safety, fairness, and social benefit.
4. **Enterprise-Grade:** Security, scalability, and auditability first.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Document Processing Accuracy | > 95% |
| Average Processing Time | < 10 seconds |
| Human Intervention Rate | < 15% of documents |
| Lighthouse Performance Score | > 90 |
| WCAG Accessibility Level | AA |
