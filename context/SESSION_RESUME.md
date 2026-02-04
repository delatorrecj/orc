# ORC: Session Resume Prompt

**Last Updated:** 2026-02-04 16:19
**Purpose:** Provide context for future AI sessions to continue development seamlessly.

---

## Project Overview

**Name:** ORC (Eco-Orchestrator)
**Mission:** Solve the billion-dollar supply chain "Viability Crisis" by building an Agentic Intake Layer that transforms chaotic documents into audit-ready, structured data.

**Core Value Proposition:**
- Sits *in front* of ERPs (SAP/Oracle) as a "System of Intake"
- Uses multi-agent orchestration powered by Gemini 2.5 Flash
- Targets CSRD compliance and Scope 3 carbon reporting

---

## Current System State

### What's Built & Working:
1. **Orchestration Pipeline** (`web/app/api/orchestrate/route.ts`)
   - Gatekeeper Agent: Document classification
   - Analyst Agent: Data extraction (line items, totals)
   - Guardian Agent: Compliance validation (PII, fraud, math)

2. **Frontend Dashboard** (`web/app/app/page.tsx`)
   - File upload via Dropzone
   - Real-time Activity Feed showing agent logs
   - Result cards displaying extracted data

3. **Configuration**
   - Prompt Engine: `orc_prompt_engine.json` (centralized agent prompts)
   - Model: `models/gemini-2.5-flash` via `lib/gemini.ts`
   - API Key: `.env.local` → `GEMINI_API_KEY`

4. **Test Data**
   - `data/golden_dataset/` contains 15 sample invoices/POs

### Key Files to Know:
| File | Purpose |
|------|---------|
| `context/ORC_Roadmap.md` | 5-phase development plan |
| `context/ORC_Product_Context.md` | Brand, content, and SEO strategy |
| `context/ORC_Engineering_Standard.md` | Security, validation, HITL rules |
| `orc_prompt_engine.json` | Agent prompt definitions |
| `web/hooks/useOrchestrator.ts` | Frontend state management |
| `web/lib/schemas.ts` | Zod validation schemas |

---

## Roadmap Status

| Phase | Name | Status |
|-------|------|--------|
| 1 | Core Pipeline Hardening | 🔄 In Progress |
| 2 | Trust & Auditability | ⏸️ Not Started |
| 3 | Communication Layer | ⏸️ Not Started |
| 4 | Intelligence Layer | ⏸️ Not Started |
| 5 | Frontend Polish | ⏸️ Not Started |

---

## Next Session Priority

### Immediate Task: Phase 1 Completion
**Feature:** Line Items Display

**What to Do:**
1. Update the Dashboard results panel (`page.tsx`) to show an expandable section with extracted line items.
2. Each line item should display: SKU, Description, Quantity, Unit Price, Total.
3. Add an "Export to JSON" button for the orchestrated data.

**Files to Modify:**
- `web/app/app/page.tsx` (Results panel)
- Possibly create a new `LineItemsTable` component

### After That:
- Phase 2: Implement Grounding Map UI (PDF coordinates)
- Phase 2: Add Accept/Review/Reject approval buttons

---

## Important Notes

1. **No Hackathon Framing:** This is an enterprise-grade, production-ready project. Avoid any "demo" or "MVP" language.
2. **Glass Box Philosophy:** All AI decisions must be transparent and traceable.
3. **Human-in-the-Loop:** Critical decisions require human approval.
4. **Model:** Always use `models/gemini-2.5-flash` (not just `gemini-2.5-flash`).

---

## How to Start the Dev Server

```bash
cd c:\Users\delat\OneDrive\Desktop\orc\web
npm run dev
```

Then open: http://localhost:3000/app

---

## Session Log

For complete history, see: `context/log.md`
