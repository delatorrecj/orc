"use client";

import { useState } from "react";
import { ClipboardList, ChevronDown, ChevronUp, Download, Trash2, Check, X, Eye } from "lucide-react";
import type { AuditLogEntry } from "@/hooks/useAuditLog";

interface AuditLogPanelProps {
    auditLog: AuditLogEntry[];
    onExport: () => void;
    onClear: () => void;
}

export function AuditLogPanel({ auditLog, onExport, onClear }: AuditLogPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const getActionIcon = (action: AuditLogEntry["action"]) => {
        switch (action) {
            case "APPROVED":
                return <Check className="w-4 h-4 text-success" />;
            case "REJECTED":
                return <X className="w-4 h-4 text-critical" />;
            case "FLAGGED_FOR_REVIEW":
                return <Eye className="w-4 h-4 text-warning" />;
        }
    };

    const getActionColor = (action: AuditLogEntry["action"]) => {
        switch (action) {
            case "APPROVED":
                return "border-l-success bg-success/5";
            case "REJECTED":
                return "border-l-critical bg-critical/5";
            case "FLAGGED_FOR_REVIEW":
                return "border-l-warning bg-warning/5";
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (auditLog.length === 0 && !isExpanded) {
        return null; // Don't show panel if no entries
    }

    return (
        <div className="glass-panel rounded-xl overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    <span className="text-white font-bold">Audit Log</span>
                    <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-mono">
                        {auditLog.length} entries
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Expanded Content */}
            <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="border-t border-white/10">
                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 px-4 py-2 bg-white/5">
                        <button
                            onClick={onExport}
                            disabled={auditLog.length === 0}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            <Download className="w-3 h-3" />
                            Export JSON
                        </button>
                        {!showClearConfirm ? (
                            <button
                                onClick={() => setShowClearConfirm(true)}
                                disabled={auditLog.length === 0}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-critical/10 hover:bg-critical/20 text-critical rounded transition-colors disabled:opacity-50 cursor-pointer"
                            >
                                <Trash2 className="w-3 h-3" />
                                Clear
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Confirm?</span>
                                <button
                                    onClick={() => {
                                        onClear();
                                        setShowClearConfirm(false);
                                    }}
                                    className="px-2 py-1 text-xs bg-critical text-white rounded cursor-pointer"
                                >
                                    Yes
                                </button>
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    className="px-2 py-1 text-xs bg-white/10 text-white rounded cursor-pointer"
                                >
                                    No
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Log Entries */}
                    <div className="max-h-[350px] overflow-y-auto">
                        {auditLog.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">No audit entries yet.</p>
                                <p className="text-xs">Entries will appear here after you approve or reject documents.</p>
                            </div>
                        ) : (
                            auditLog.slice(0, 10).map((entry) => (
                                <div
                                    key={entry.id}
                                    className={`border-l-4 ${getActionColor(entry.action)} border-b border-white/5`}
                                >
                                    {/* Entry Header */}
                                    <button
                                        onClick={() => setExpandedEntryId(expandedEntryId === entry.id ? null : entry.id)}
                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            {getActionIcon(entry.action)}
                                            <div className="text-left">
                                                <p className="text-sm text-white font-medium truncate max-w-[200px]">
                                                    {entry.document.filename}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {entry.document.docType} • {entry.document.vendorName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500 font-mono">
                                                {formatTimestamp(entry.timestamp)}
                                            </span>
                                            {expandedEntryId === entry.id ? (
                                                <ChevronUp className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Entry Details */}
                                    {expandedEntryId === entry.id && (
                                        <div className="px-4 pb-3 space-y-2 text-xs">
                                            <div className="grid grid-cols-2 gap-4 p-3 bg-white/5 rounded-lg">
                                                <div>
                                                    <span className="text-gray-500">Amount</span>
                                                    <p className="text-white font-mono">
                                                        {entry.extraction.totalAmount.toLocaleString()} {entry.extraction.currency}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Line Items</span>
                                                    <p className="text-white font-mono">{entry.extraction.lineItemsCount}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Confidence</span>
                                                    <p className="text-white font-mono">
                                                        {Math.round(entry.decision.gatekeeperConfidence * 100)}%
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Guardian</span>
                                                    <p className="text-white font-mono">{entry.decision.guardianStatus}</p>
                                                </div>
                                            </div>
                                            {entry.decision.piiDetected && (
                                                <div className="p-2 bg-critical/10 rounded text-critical">
                                                    ⚠️ PII was detected in this document
                                                </div>
                                            )}
                                            {entry.reason && (
                                                <div className="p-2 bg-white/5 rounded">
                                                    <span className="text-gray-500">Rejection Reason:</span>
                                                    <p className="text-white mt-1">{entry.reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {auditLog.length > 10 && (
                        <div className="px-4 py-2 text-center text-xs text-gray-500 bg-white/5">
                            Showing 10 of {auditLog.length} entries. Export to see all.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
