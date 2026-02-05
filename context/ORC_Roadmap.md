# ORC: Product Roadmap

**Version:** 1.0 (Enterprise Production)
**Mission:** Build an industry-grade Agentic Intake Layer that solves the billion-dollar supply chain viability crisis.

---

## Phase 1: Core Pipeline Hardening
**Status:** ✅ Complete
**Goal:** Establish a robust, production-ready document processing pipeline.

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| Document Classification (Gatekeeper) | Critical | ✅ Complete | Identify document type (Invoice, PO, etc.) |
| Data Extraction (Analyst) | Critical | ✅ Complete | Extract line items, totals, dates |
| Compliance Validation (Guardian) | Critical | ✅ Complete | PII, math, fraud checks |
| Prompt Engine Architecture | High | ✅ Complete | Centralized `orc_prompt_engine.json` |
| Error Surfacing & Logging | High | ✅ Complete | Real-time Activity Feed |
| **Line Items Display** | High | ✅ Complete | Expandable UI showing extracted SKUs, quantities, prices |
| **Extraction Results Export** | Medium | ✅ Complete | Download as JSON/CSV button |

---

## Phase 2: Trust & Auditability
**Status:** ✅ Complete
**Goal:** Enable enterprise-grade audit trails and human oversight.

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| **Grounding Map** | Critical | 🔲 Pending (Phase 2.5) | PDF page + bounding box coordinates for every extracted value |
| **Verification Card UI** | Critical | ✅ Complete | Side-by-side PDF viewer with extracted data overlay |
| **Human Approval Flow** | Critical | ✅ Complete | Accept/Review/Reject buttons for flagged documents |
| **PII Redaction Layer** | High | ✅ Complete | Detection + warning indicators (Cloud DLP deferred) |
| Confidence Threshold Enforcement | High | ✅ Complete | Block automation if confidence < 90% |
| Audit Log Database | Medium | ✅ Complete | localStorage-based with JSON export |

---

## Phase 3: Communication Layer (Module A)
**Status:** 🔄 Tier 1 Complete
**Goal:** Autonomous supplier outreach and response monitoring.

| Feature | Priority | Status | Description |
|---------|----------|--------|-------------|
| **Email Drafting Agent** | Critical | ✅ Complete | Gemini-powered email generation with templates |
| Template System | High | ✅ Complete | Inquiry, Follow-up, Negotiation, Confirmation |
| Draft Approval Workflow | High | ✅ Complete | Review, edit, approve/reject before sending |
| Copy to Clipboard | High | ✅ Complete | Manual send workflow (Gmail API deferred) |
| Communication Log | Medium | ✅ Complete | localStorage-based draft history |
| **Email Intake Agent** | Critical | 🔲 Deferred (Tier 2) | Gmail API integration for sending/receiving |
| Supplier Sentiment History | High | 🔲 Deferred | Track response patterns per vendor |
| Auto-Follow-Up Scheduler | Medium | 🔲 Deferred | Escalation logic for non-responders |

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
| **Mobile Responsiveness** | Critical | ✅ Complete | Dashboard padding, tables, grid audit |
| **SEO Optimization** | Critical | ✅ Complete | Metadata, Favicons, Brand Assets |
| **Schema.org Metadata** | High | ✅ Complete | BusinessModel, SoftwareApplication entities |
| **Performance Optimization** | High | ✅ Complete | Next.js Fonts (Inter/JetBrains) optimization |
| **Marketing Landing Copy** | High | ✅ Complete | Aligned with Glass Box Brand Essence |
| **OG Image Generation** | Medium | ✅ Complete | Configured in metadata |
| **Accessibility Audit** | Medium | ✅ Complete | ARIA, Keyboard Nav, Semantic HTML |
| **Animation Polish** | Low | ✅ Complete | Interactive hover states, logo transitions |
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
