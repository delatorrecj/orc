"use client";

import { useState } from "react";
import { Mail, Send, Copy, X, RefreshCw, Check, FileText } from "lucide-react";
import { EMAIL_TEMPLATES, type EmailDraft, type EmailType } from "@/lib/emailTemplates";

interface CommunicationPanelProps {
    isVisible: boolean;
    vendorName: string;
    documentRef: string;
    totalAmount: number;
    currency: string;
    lineItemsCount: number;
    onGenerateDraft: (type: EmailType, metadata: any) => Promise<EmailDraft | null>;
    drafts: EmailDraft[];
    onApproveDraft: (id: string) => void;
    onRejectDraft: (id: string) => void;
}

export function CommunicationPanel({
    isVisible,
    vendorName,
    documentRef,
    totalAmount,
    currency,
    lineItemsCount,
    onGenerateDraft,
    drafts,
    onApproveDraft,
    onRejectDraft,
}: CommunicationPanelProps) {
    // Panel is always expanded when visible (removed dropdown behavior)
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedType, setSelectedType] = useState<EmailType>("confirmation");
    const [currentDraft, setCurrentDraft] = useState<EmailDraft | null>(null);
    const [editedBody, setEditedBody] = useState("");
    const [copySuccess, setCopySuccess] = useState(false);

    if (!isVisible) return null;

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const metadata = {
                vendorName,
                documentRef,
                totalAmount,
                currency,
                lineItemsCount,
            };
            const draft = await onGenerateDraft(selectedType, metadata);
            if (draft) {
                setCurrentDraft(draft);
                setEditedBody(draft.body);
            }
        } catch (error) {
            console.error("Failed to generate draft:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyToClipboard = async () => {
        if (!currentDraft) return;

        const fullEmail = `To: ${currentDraft.to}
Subject: ${currentDraft.subject}

${editedBody}`;

        try {
            await navigator.clipboard.writeText(fullEmail);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleApprove = () => {
        if (!currentDraft) return;
        onApproveDraft(currentDraft.id);
        setCurrentDraft(null);
        setEditedBody("");
    };

    const handleReject = () => {
        if (!currentDraft) return;
        onRejectDraft(currentDraft.id);
        setCurrentDraft(null);
        setEditedBody("");
    };

    const recentDrafts = drafts.slice(0, 3);

    return (
        <div className="glass-panel rounded-xl overflow-hidden">
            {/* Header - No longer a toggle button */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-bold">Supplier Communication</span>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">
                        Phase 3
                    </span>
                </div>
            </div>

            {/* Content - Always visible */}
            <div className="p-4 space-y-4">

                {/* Template Selection */}
                {!currentDraft && (
                    <div className="space-y-3">
                        <label className="block text-sm text-gray-400">Select Email Template</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.entries(EMAIL_TEMPLATES) as [EmailType, typeof EMAIL_TEMPLATES[EmailType]][]).map(([type, template]) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedType(type)}
                                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${selectedType === type
                                        ? "border-purple-500 bg-purple-500/10"
                                        : "border-white/10 bg-white/5 hover:border-white/20"
                                        }`}
                                >
                                    <p className={`text-sm font-medium ${selectedType === type ? "text-purple-400" : "text-white"
                                        }`}>
                                        {template.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            {isGenerating ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Generating Draft...
                                </>
                            ) : (
                                <>
                                    <FileText className="w-4 h-4" />
                                    Generate Email Draft
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Draft Preview */}
                {currentDraft && (
                    <div className="space-y-3">
                        {/* Email Header */}
                        <div className="p-3 bg-white/5 rounded-lg space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500 w-12">To:</span>
                                <span className="text-white font-mono">{currentDraft.to}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500 w-12">Subject:</span>
                                <span className="text-white">{currentDraft.subject}</span>
                            </div>
                        </div>

                        {/* Editable Body */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Email Body (editable)</label>
                            <textarea
                                value={editedBody}
                                onChange={(e) => setEditedBody(e.target.value)}
                                className="w-full h-48 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none font-mono text-sm"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between gap-3">
                            <button
                                onClick={handleReject}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                                Discard
                            </button>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleCopyToClipboard}
                                    className={`flex items-center gap-2 px-4 py-2 ${copySuccess
                                        ? "bg-success/20 text-success border-success/30"
                                        : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                                        } border rounded-lg transition-colors cursor-pointer`}
                                >
                                    {copySuccess ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy to Clipboard
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleApprove}
                                    className="flex items-center gap-2 px-4 py-2 bg-success/20 hover:bg-success/30 text-success border border-success/30 rounded-lg transition-colors cursor-pointer"
                                >
                                    <Send className="w-4 h-4" />
                                    Approve Draft
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Drafts History */}
                {recentDrafts.length > 0 && !currentDraft && (
                    <div className="pt-3 border-t border-white/10">
                        <h4 className="text-sm text-gray-400 mb-2">Recent Drafts</h4>
                        <div className="space-y-2">
                            {recentDrafts.map((draft) => (
                                <div
                                    key={draft.id}
                                    className={`p-3 rounded-lg border ${draft.status === "approved"
                                        ? "border-success/20 bg-success/5"
                                        : draft.status === "rejected"
                                            ? "border-critical/20 bg-critical/5"
                                            : "border-white/10 bg-white/5"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-white">{draft.subject}</p>
                                            <p className="text-xs text-gray-500">
                                                To: {draft.to} • {new Date(draft.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${draft.status === "approved"
                                            ? "bg-success/20 text-success"
                                            : draft.status === "rejected"
                                                ? "bg-critical/20 text-critical"
                                                : "bg-warning/20 text-warning"
                                            }`}>
                                            {draft.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
