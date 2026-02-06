"use client";

import { useState, useMemo, useEffect } from "react";
import { CONFIDENCE_THRESHOLD } from "@/lib/schemas";
// import { API_BASE_URL } from "../lib/config";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type LogType = "info" | "success" | "warning" | "error" | "processing";

export interface LogEntry {
    id: string;
    agent: "SYSTEM" | "GATEKEEPER" | "ANALYST" | "GUARDIAN" | "HUMAN";
    message: string;
    timestamp: string;
    type: LogType;
}

export type ApprovalStatus = "pending" | "approved" | "rejected" | "flagged_for_review" | null;

export type WorkflowPhase = "intake" | "processing" | "review" | "action";

interface OrchestratorResult {
    gatekeeper: any;
    analyst: any;
    guardian: any;
    fraud?: {
        risk_score: number;
        summary: string;
        flags: { rule: string; severity: string; message: string }[];
    };
    grounding?: {
        items: { text: string; bbox: number[]; page: number; type: string }[];
        page_dimensions: Record<number, { width: number; height: number }>;
    };
}

export function useOrchestrator() {
    const [status, setStatus] = useState<"idle" | "processing" | "complete" | "error">("idle");
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [result, setResult] = useState<OrchestratorResult | null>(null);
    const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(null);
    const [currentFilename, setCurrentFilename] = useState<string>("");
    const [currentPhase, setCurrentPhase] = useState<WorkflowPhase>("intake");

    // Phase 6: Auto-advance workflow phases based on status and approval
    useEffect(() => {
        if (status === "idle" && !result) {
            setCurrentPhase("intake");
        } else if (status === "processing") {
            setCurrentPhase("processing");
        } else if (status === "complete" && approvalStatus !== "approved") {
            setCurrentPhase("review");
        } else if (approvalStatus === "approved") {
            setCurrentPhase("action");
        }
    }, [status, approvalStatus, result]);

    // Computed: Check if human review is required based on confidence, Guardian status, and PII
    const requiresHumanReview = useMemo(() => {
        if (!result) return false;

        const gatekeeperConfidence = result.gatekeeper?.confidence_score ?? 1;
        const guardianStatus = result.guardian?.status;
        const guardianRequiresReview = result.guardian?.requires_human_review ?? false;
        const piiDetected = result.guardian?.pii_detected ?? false;

        return (
            gatekeeperConfidence < CONFIDENCE_THRESHOLD ||
            guardianStatus === "REVIEW" ||
            guardianStatus === "REJECT" ||
            guardianRequiresReview ||
            piiDetected // PII always requires human review
        );
    }, [result]);

    const addLog = (agent: LogEntry["agent"], message: string, type: LogType) => {
        const newLog: LogEntry = {
            id: Math.random().toString(36).substr(2, 9),
            agent,
            message,
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
            type,
        };
        setLogs((prev) => [newLog, ...prev]);
    };

    const orchestrate = async (file: File) => {
        setStatus("processing");
        setLogs([]); // Clear old logs
        setResult(null);
        setCurrentFilename(file.name); // Track filename for audit log

        // Initial Logs
        addLog("SYSTEM", "Orchestration sequence initiated.", "info");
        addLog("SYSTEM", `Ingesting artifact: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`, "info");
        addLog("GATEKEEPER", "Analysis protocol started...", "processing");

        const formData = new FormData();
        formData.append("file", file);


        // Python API endpoint (FastAPI server)
        const PYTHON_API_URL = `${API_BASE_URL}/extract`;
        const JS_API_URL = "/api/orchestrate";

        try {
            // Try Python API first, fallback to JS route
            let response: Response;
            try {
                response = await fetch(PYTHON_API_URL, {
                    method: "POST",
                    body: formData,
                });
                addLog("SYSTEM", "Using Python extraction engine (pdfplumber + Gemini)", "info");
            } catch (pythonError) {
                // Python API not available, fallback to JS
                addLog("SYSTEM", "Python API unavailable, using JS fallback", "warning");
                response = await fetch(JS_API_URL, {
                    method: "POST",
                    body: formData,
                });
            }

            if (!response.ok) {
                let errorMessage = `Server Error: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    console.error("Failed to parse error JSON", e);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // --- LOG SIMULATION (Retina-scan effect) ---
            // In a real app we'd stream these, but we simulate the 'receipt' of data

            // 1. Gatekeeper Success
            if (data.gatekeeper) {
                addLog("GATEKEEPER", `Identified: ${data.gatekeeper.doc_type} (Confidence: ${(data.gatekeeper.confidence_score * 100).toFixed(0)}%)`, "success");
                if (data.gatekeeper.summary) {
                    addLog("GATEKEEPER", `Summary: ${data.gatekeeper.summary}`, "info");
                }
            }

            // 2. Analyst Success
            if (data.analyst) {
                addLog("ANALYST", `Extracted ${data.analyst.line_items?.length || 0} line items.`, "success");
                addLog("ANALYST", `Total Value: ${data.analyst.total_amount} ${data.analyst.currency}`, "info");
            } else {
                addLog("ANALYST", "Skipped extraction (Document type not supported for deep analysis).", "warning");
            }

            // 3. Guardian Success
            if (data.guardian) {
                if (data.guardian.status === 'PASS') {
                    addLog("GUARDIAN", "Compliance Check: PASSED. No anomalies detected.", "success");
                } else {
                    addLog("GUARDIAN", `Compliance Check: ${data.guardian.status}. Review flags raised.`, "warning");
                    data.guardian.flags?.forEach((flag: string) => addLog("GUARDIAN", `Flag: ${flag}`, "warning"));
                }
            }

            setResult(data);
            setStatus("complete");

            // Set initial approval status based on whether review is required
            const piiDetected = data.guardian?.pii_detected ?? false;
            const needsReview =
                (data.gatekeeper?.confidence_score ?? 1) < CONFIDENCE_THRESHOLD ||
                data.guardian?.status === "REVIEW" ||
                data.guardian?.status === "REJECT" ||
                piiDetected;

            setApprovalStatus(needsReview ? "pending" : "pending");

            if (needsReview) {
                addLog("SYSTEM", "⚠️ Human review required before approval.", "warning");
                if (piiDetected) {
                    addLog("GUARDIAN", "🔒 PII detected in document. Manual review required.", "warning");
                }
            }

            addLog("SYSTEM", "Orchestration complete. Awaiting human decision.", "success");

        } catch (error: any) {
            console.error("Orchestration failed", error);
            setStatus("error");
            addLog("SYSTEM", `Critical Failure: ${error.message}`, "error");
        }
    };

    // --- APPROVAL ACTIONS ---
    const approveDocument = () => {
        if (!result) return;
        setApprovalStatus("approved");
        addLog("HUMAN", "✅ Document APPROVED for processing.", "success");
    };

    const rejectDocument = (reason: string) => {
        if (!result) return;
        setApprovalStatus("rejected");
        addLog("HUMAN", `❌ Document REJECTED. Reason: ${reason}`, "error");
    };

    const flagForReview = () => {
        if (!result) return;
        setApprovalStatus("flagged_for_review");
        addLog("HUMAN", "🔍 Document flagged for manual review.", "warning");
    };

    const resetApproval = () => {
        setApprovalStatus(null);
    };

    return {
        status,
        logs,
        result,
        orchestrate,
        // Phase 2: Approval state and actions
        approvalStatus,
        requiresHumanReview,
        approveDocument,
        rejectDocument,
        flagForReview,
        resetApproval,
        currentFilename,
        // Phase 6: Workflow phase tracking
        currentPhase,
    };
}
