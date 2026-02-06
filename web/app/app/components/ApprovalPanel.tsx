"use client";

import { useState } from "react";
import { Check, X, Eye, AlertTriangle } from "lucide-react";
import type { ApprovalStatus } from "@/hooks/useOrchestrator";

interface ApprovalPanelProps {
    approvalStatus: ApprovalStatus;
    requiresHumanReview: boolean;
    onApprove: () => void;
    onReject: (reason: string) => void;
    onFlagForReview: () => void;
    isProcessing: boolean;
}

export function ApprovalPanel({
    approvalStatus,
    requiresHumanReview,
    onApprove,
    onReject,
    onFlagForReview,
    isProcessing,
}: ApprovalPanelProps) {
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const handleReject = () => {
        if (rejectReason.trim()) {
            onReject(rejectReason.trim());
            setShowRejectModal(false);
            setRejectReason("");
        }
    };

    // If already decided, show the result
    if (approvalStatus === "approved") {
        return (
            <div className="glass-panel rounded-xl p-4 border-l-4 border-l-success">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-success" />
                    </div>
                    <div>
                        <p className="text-success font-bold">Document Approved</p>
                        <p className="text-sm text-gray-400">Ready for downstream processing</p>
                    </div>
                </div>
            </div>
        );
    }

    if (approvalStatus === "rejected") {
        return (
            <div className="glass-panel rounded-xl p-4 border-l-4 border-l-critical">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-critical/20 flex items-center justify-center">
                        <X className="w-5 h-5 text-critical" />
                    </div>
                    <div>
                        <p className="text-critical font-bold">Document Rejected</p>
                        <p className="text-sm text-gray-400">Flagged for manual correction</p>
                    </div>
                </div>
            </div>
        );
    }

    if (approvalStatus === "flagged_for_review") {
        return (
            <div className="glass-panel rounded-xl p-4 border-l-4 border-l-warning">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                        <p className="text-warning font-bold">Flagged for Review</p>
                        <p className="text-sm text-gray-400">Queued for manual inspection</p>
                    </div>
                </div>
            </div>
        );
    }

    // Pending state - show action buttons
    return (
        <>
            <div className="glass-panel rounded-xl overflow-hidden">
                {/* Warning Banner if review required */}
                {requiresHumanReview && (
                    <div className="px-4 py-3 bg-warning/10 border-b border-warning/20 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        <span className="text-sm text-warning font-medium">
                            Human review required — Confidence below threshold or flags detected
                        </span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="p-4 flex items-center justify-between gap-4">
                    <div className="text-sm text-gray-400">
                        <span className="font-medium text-white">Human Decision Required:</span>{" "}
                        Review the extraction and make a decision.
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Flag for Review Button */}
                        <button
                            onClick={onFlagForReview}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">Review Later</span>
                        </button>

                        {/* Reject Button */}
                        <button
                            onClick={() => setShowRejectModal(true)}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2 bg-critical/10 hover:bg-critical/20 text-critical border border-critical/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                            <span className="text-sm font-medium">Reject</span>
                        </button>

                        {/* Approve Button */}
                        <button
                            onClick={onApprove}
                            disabled={isProcessing}
                            className="flex items-center gap-2 px-4 py-2 bg-success/10 hover:bg-success/20 text-success border border-success/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Check className="w-4 h-4" />
                            <span className="text-sm font-medium">Approve</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="reject-modal-title"
                >
                    <div className="glass-panel rounded-xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                            <h3 id="reject-modal-title" className="text-lg font-bold text-white">Reject Document</h3>
                            <p className="text-sm text-gray-400 mt-1">
                                Please provide a reason for rejection.
                            </p>
                        </div>

                        <div className="p-4">
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="e.g., Math errors detected, vendor information mismatch..."
                                className="w-full h-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                                autoFocus
                            />
                        </div>

                        <div className="p-4 border-t border-white/10 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason("");
                                }}
                                className="px-4 py-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-critical hover:bg-critical/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
