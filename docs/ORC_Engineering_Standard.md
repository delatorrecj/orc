# ORC Comprehensive Engineering Guidelines

**Version:** 2.2 (Enterprise Production)
**Context:** Enterprise Supply Chain Orchestration
**Core Constraint:** Compliance with [Google AI Principles](google_ai_principles.md) and "Glass Box" Philosophy.

## 1. Architecture & Tech Stack (Adapted)

To meet enterprise delivery standards while maintaining system rigidity, we have adapted the "Agentic Stack":

### 1.1 The Orchestrator (Next.js 16 + Serverless)
*   **Framework:** **Next.js 16 (App Router)**.
*   **Role:** Unified Frontend + Backend (Orchestration Layer).
*   **Security Rule:**
    *   **Server Components (RSC):** ALL LLM calls and Database logic MUST execute here.
    *   **Client Components:** UI Interactive elements ONLY.
    *   **Streaming:** Use `Generative UI` patterns (streamed JSON parsing) to show "Thinking..." states.

### 1.2 The Cognitive Engine (Gemini 2.5 Flash)
*   **Model:** `gemini-2.5-flash` (standardized across all agents).
*   **Validation:** **Zod** (TypeScript) is the mandatory schema validation library (replacing Pydantic for this Node.js environment).
    *   *Why:* Zod provides the same strict runtime checks as Pydantic but works natively with Next.js/TypeScript.

## 2. Security Protocols (The "Guardian" Layer)

**Mandate:** Aligned with Google AI Principle #2 (Safety & Privacy).

### 2.1 PII Masking (The "Veil")
**Requirement:** No raw PII (Names, Phone Numbers) should index into the "Golden Database" / Vector Store.
*   **Implementation:** The **Guardian Agent** must perform a "Redaction Pass" before data persistence.
    *   *Scan:* Regex/LLM check for Email, Phone, Address.
    *   *Action:* Replace with `<REDACTED_ENTITY>`.

### 2.2 OWASP Top 10 Defenses
*   **LLM01 (Prompt Injection):** NEVER concatenate user input directly. Use parameterized prompts.
*   **LLM06 (Excessive Agency):** Agents are Read-Only by default. Write permissions (e.g., "Approve Invoice") require a specific `action_token`.

### 2.3 Human-in-the-Loop (HITL) Triggers
**Rule:** The system **BLOCKS** automation and requires Human Review if:
1.  **Confidence Score** < 85%.
2.  **Fraud Check** = Positive (Round Number Bias).
3.  **Variance Check** > 20% vs Historical Average.

## 3. Data Validation & Engineering

**Philosophy:** "Garbage in, hallucination out."

### 3.1 Strict Structured Outputs
*   **Constraint:** Never parse raw strings from the LLM.
*   **Pattern:**
    1.  Define **Zod Schema**.
    2.  Prompt Gemini to return JSON.
    3.  `JSON.parse()` + `Schema.parse()`.
    4.  **Self-Correction Loop:** If validation fails, feed the Zod error back to Gemini to fix.

### 3.2 The "Golden Dataset"
*   **Location:** `data/golden_dataset/`
*   **Rule:** Any prompt logic change MUST be verified against the 15 Golden files. Accuracy must remain > 90%.

## 4. Agent Definitions

### Gatekeeper (Intake)
*   **Role:** Vision + Classification.
*   **Output:** `doc_type`, `vendor_name`, `confidence`.

### Analyst (Extraction)
*   **Role:** Deep Extraction + Normalization.
*   **Output:** `line_items`, `details`, `math_validation`.

### Guardian (Compliance)
*   **Role:** The Auditor (Safety/Bias/Fraud).
*   **Output:** `status` (PASS/REVIEW/REJECT), `flags`.

## 5. Development Standards
*   **Artifacts:** Agents must generate Markdown summaries ("Verification Cards") for human trust.
*   **Logging:** All agent thoughts/actions must be logged to a persistent store (or local file for MVP).
