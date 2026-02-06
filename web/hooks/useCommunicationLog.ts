"use client";

import { useState, useEffect, useCallback } from "react";
import type { EmailDraft, EmailType } from "@/lib/emailTemplates";

const COMM_LOG_KEY = "orc_communication_log";
const MAX_LOG_ENTRIES = 50;

export function useCommunicationLog() {
    const [drafts, setDrafts] = useState<EmailDraft[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                const stored = localStorage.getItem(COMM_LOG_KEY);
                if (stored) {
                    setDrafts(JSON.parse(stored));
                }
            } catch (e) {
                console.error("[CommunicationLog] Failed to load from localStorage:", e);
            }
        }
    }, []);

    // Save to localStorage
    const saveToStorage = useCallback((entries: EmailDraft[]) => {
        if (typeof window !== "undefined") {
            try {
                localStorage.setItem(COMM_LOG_KEY, JSON.stringify(entries));
            } catch (e) {
                console.error("[CommunicationLog] Failed to save to localStorage:", e);
            }
        }
    }, []);

    const addDraft = useCallback((draft: EmailDraft) => {
        setDrafts((prev) => {
            const updated = [draft, ...prev].slice(0, MAX_LOG_ENTRIES);
            saveToStorage(updated);
            return updated;
        });
    }, [saveToStorage]);

    const updateDraft = useCallback((id: string, updates: Partial<EmailDraft>) => {
        setDrafts((prev) => {
            const updated = prev.map((d) =>
                d.id === id ? { ...d, ...updates } : d
            );
            saveToStorage(updated);
            return updated;
        });
    }, [saveToStorage]);

    const approveDraft = useCallback((id: string) => {
        updateDraft(id, { status: "approved" });
        console.log("[CommunicationLog] Draft approved:", id);
    }, [updateDraft]);

    const rejectDraft = useCallback((id: string) => {
        updateDraft(id, { status: "rejected" });
        console.log("[CommunicationLog] Draft rejected:", id);
    }, [updateDraft]);

    const markAsSent = useCallback((id: string) => {
        updateDraft(id, { status: "sent" });
        console.log("[CommunicationLog] Draft marked as sent:", id);
    }, [updateDraft]);

    const deleteDraft = useCallback((id: string) => {
        setDrafts((prev) => {
            const updated = prev.filter((d) => d.id !== id);
            saveToStorage(updated);
            return updated;
        });
    }, [saveToStorage]);

    const getDraftsByStatus = useCallback((status: EmailDraft["status"]) => {
        return drafts.filter((d) => d.status === status);
    }, [drafts]);

    const exportCommunicationLog = useCallback(() => {
        const jsonContent = JSON.stringify(drafts, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `orc_communication_log_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [drafts]);

    const clearCommunicationLog = useCallback(() => {
        setDrafts([]);
        if (typeof window !== "undefined") {
            localStorage.removeItem(COMM_LOG_KEY);
        }
    }, []);

    return {
        drafts,
        addDraft,
        updateDraft,
        approveDraft,
        rejectDraft,
        markAsSent,
        deleteDraft,
        getDraftsByStatus,
        exportCommunicationLog,
        clearCommunicationLog,
    };
}
