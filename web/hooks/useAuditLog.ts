"use client";

import { useState, useEffect, useCallback } from "react";

// --- AUDIT LOG TYPES ---
export interface AuditLogEntry {
    id: string;
    timestamp: string;
    action: "APPROVED" | "REJECTED" | "FLAGGED_FOR_REVIEW";
    document: {
        filename: string;
        docType: string;
        vendorName: string;
    };
    extraction: {
        totalAmount: number;
        currency: string;
        lineItemsCount: number;
    };
    decision: {
        gatekeeperConfidence: number;
        guardianStatus: string;
        guardianFlags: string[];
        requiresHumanReview: boolean;
        piiDetected: boolean;
    };
    reason?: string; // For rejections
}

const AUDIT_LOG_KEY = "orc_audit_log";
const MAX_LOG_ENTRIES = 100; // Keep last 100 entries

// --- AUDIT LOG HOOK ---
export function useAuditLog() {
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem(AUDIT_LOG_KEY);
                if (stored) {
                    setAuditLog(JSON.parse(stored));
                }
            } catch (e) {
                console.error("[AuditLog] Failed to load from localStorage:", e);
            }
        }
    }, []);

    // Save to localStorage whenever auditLog changes
    const saveToStorage = useCallback((entries: AuditLogEntry[]) => {
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(entries));
            } catch (e) {
                console.error("[AuditLog] Failed to save to localStorage:", e);
            }
        }
    }, []);

    const generateId = () => {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    const createEntry = (
        action: AuditLogEntry["action"],
        result: any,
        filename: string,
        reason?: string
    ): AuditLogEntry => {
        return {
            id: generateId(),
            timestamp: new Date().toISOString(),
            action,
            document: {
                filename,
                docType: result?.gatekeeper?.doc_type || "Unknown",
                vendorName: result?.gatekeeper?.vendor_name || "Unknown",
            },
            extraction: {
                totalAmount: result?.analyst?.total_amount || 0,
                currency: result?.analyst?.currency || "USD",
                lineItemsCount: result?.analyst?.line_items?.length || 0,
            },
            decision: {
                gatekeeperConfidence: result?.gatekeeper?.confidence_score || 0,
                guardianStatus: result?.guardian?.status || "REVIEW",
                guardianFlags: result?.guardian?.flags || [],
                requiresHumanReview: result?.guardian?.requires_human_review || false,
                piiDetected: result?.guardian?.pii_detected || false,
            },
            reason,
        };
    };

    const addEntry = useCallback((entry: AuditLogEntry) => {
        setAuditLog((prev) => {
            // Add new entry at the beginning, limit to MAX_LOG_ENTRIES
            const updated = [entry, ...prev].slice(0, MAX_LOG_ENTRIES);
            saveToStorage(updated);
            return updated;
        });
    }, [saveToStorage]);

    // --- PUBLIC ACTIONS ---
    const logApproval = useCallback((result: any, filename: string) => {
        const entry = createEntry("APPROVED", result, filename);
        addEntry(entry);
        console.log("[AuditLog] Logged APPROVAL:", entry.id);
    }, [addEntry]);

    const logRejection = useCallback((result: any, filename: string, reason: string) => {
        const entry = createEntry("REJECTED", result, filename, reason);
        addEntry(entry);
        console.log("[AuditLog] Logged REJECTION:", entry.id);
    }, [addEntry]);

    const logFlaggedForReview = useCallback((result: any, filename: string) => {
        const entry = createEntry("FLAGGED_FOR_REVIEW", result, filename);
        addEntry(entry);
        console.log("[AuditLog] Logged FLAGGED_FOR_REVIEW:", entry.id);
    }, [addEntry]);

    const exportAuditLog = useCallback(() => {
        const jsonContent = JSON.stringify(auditLog, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `orc_audit_log_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [auditLog]);

    const clearAuditLog = useCallback(() => {
        setAuditLog([]);
        if (typeof window !== "undefined") {
            localStorage.removeItem(AUDIT_LOG_KEY);
        }
        console.log("[AuditLog] Cleared all entries");
    }, []);

    return {
        auditLog,
        logApproval,
        logRejection,
        logFlaggedForReview,
        exportAuditLog,
        clearAuditLog,
    };
}
