"use client";

import { useRef, useEffect, useState } from "react";
import { FileText, AlertTriangle } from "lucide-react";
import { Dropzone } from "./components/Dropzone";
import { ActivityFeed } from "./components/ActivityFeed";
import { LineItemsTable } from "./components/LineItemsTable";
import { ExportDropdown } from "./components/ExportDropdown";
import { VerificationCard } from "./components/VerificationCard";
import { ApprovalPanel } from "./components/ApprovalPanel";
import { AuditLogPanel } from "./components/AuditLogPanel";
import { CommunicationPanel } from "./components/CommunicationPanel";
import { WorkflowStepper } from "./components/WorkflowStepper";
import dynamic from "next/dynamic";

const DocumentPreview = dynamic(
    () => import("./components/DocumentPreview").then((mod) => mod.DocumentPreview),
    { ssr: false }
);
import { ModeSelector, type IntakeMode } from "./components/ModeSelector";
import { useOrchestrator } from "@/hooks/useOrchestrator";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useCommunicationLog } from "@/hooks/useCommunicationLog";
import type { EmailType, EmailDraft } from "@/lib/emailTemplates";

export default function DashboardPage() {
    const {
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
        currentFilename,
        // Phase 6: Workflow phase
        currentPhase,
    } = useOrchestrator();

    const {
        auditLog,
        logApproval,
        logRejection,
        logFlaggedForReview,
        exportAuditLog,
        clearAuditLog,
    } = useAuditLog();

    // Phase 6: Mode state (Manual vs Automated)
    const [intakeMode, setIntakeMode] = useState<IntakeMode>("manual");
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    const handleFileSelect = async (file: File) => {
        const url = URL.createObjectURL(file);
        setFileUrl(url);
        await orchestrate(file);
    };

    // Phase 6: Section refs for auto-scroll
    const reviewRef = useRef<HTMLDivElement>(null);
    const actionRef = useRef<HTMLDivElement>(null);

    // Phase 6: Auto-scroll when phase changes
    useEffect(() => {
        if (currentPhase === "review" && reviewRef.current) {
            reviewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        if (currentPhase === "action" && actionRef.current) {
            actionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [currentPhase]);

    // Wrapper functions that combine UI action with audit logging
    const handleApprove = () => {
        approveDocument();
        logApproval(result, currentFilename);
    };

    const handleReject = (reason: string) => {
        rejectDocument(reason);
        logRejection(result, currentFilename, reason);
    };

    const handleFlagForReview = () => {
        flagForReview();
        logFlaggedForReview(result, currentFilename);
    };

    // Phase 3: Communication Log
    const {
        drafts,
        addDraft,
        approveDraft,
        rejectDraft,
    } = useCommunicationLog();

    // Generate email draft via API
    const handleGenerateDraft = async (type: EmailType, metadata: any): Promise<EmailDraft | null> => {
        try {
            const response = await fetch("/api/compose-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, metadata }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate email");
            }

            const data = await response.json();
            if (data.draft) {
                addDraft(data.draft);
                return data.draft;
            }
            return null;
        } catch (error) {
            console.error("Failed to generate draft:", error);
            return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">

            {/* Header with Mode Selector */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
                    <p className="text-gray-400">System Ready. Awaiting intake.</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Mode Selector */}
                    <ModeSelector mode={intakeMode} onModeChange={setIntakeMode} />

                    {/* Status Indicator */}
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border ${status === 'processing' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-success/10 text-success border-success/20'}`}>
                        <span className={`w-2 h-2 rounded-full ${status === 'processing' ? 'bg-primary animate-ping' : 'bg-success animate-pulse'}`} />
                        {status === 'processing' ? 'AGENTS_ACTIVE' : 'AGENTS_ONLINE'}
                    </div>
                </div>
            </div>

            {/* Phase 6: Workflow Stepper */}
            <WorkflowStepper currentPhase={currentPhase} />

            {/* Top Section: The Event Horizon (Dropzone) - INTAKE PHASE */}
            <div className={`phase-section ${currentPhase === "intake" ? "phase-active" : result ? "phase-completed" : ""}`}>
                <Dropzone onFileSelect={handleFileSelect} isProcessing={status === 'processing'} />
            </div>

            {/* Grid: Live Feed & Data - REVIEW PHASE */}
            <div
                ref={reviewRef}
                className={`phase-section grid grid-cols-1 lg:grid-cols-3 gap-8 ${currentPhase === "review" ? "phase-active" : ""}`}
            >

                {/* Left: Agent Live Feed & Document Preview */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Document Preview (only when file is loaded) */}
                    {fileUrl && (
                        <div className="fade-in">
                            <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Source Document
                            </h3>
                            <DocumentPreview
                                fileUrl={fileUrl}
                                grounding={result?.grounding}
                            />
                        </div>
                    )}

                    <ActivityFeed logs={logs} />
                </div>

                {/* Right: Orchestrated Data Area */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-4">
                        <div className="flex items-center gap-2 text-white font-bold">
                            <FileText className="w-4 h-4 text-warning" /> Recent Extractions
                        </div>
                        {result && <ExportDropdown data={result} />}
                    </div>

                    {!result ? (
                        /* Empty State */
                        <div className="h-[400px] flex flex-col items-center justify-center text-gray-500 glass-panel rounded-xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                <FileText className="w-8 h-8 opacity-30 group-hover:opacity-60 transition-opacity" />
                            </div>
                            <p className="font-medium">No documents processed yet.</p>
                            <p className="text-xs text-gray-600 mt-2">Upload a file to begin orchestration.</p>
                        </div>
                    ) : (
                        /* Result Display */
                        <div className="space-y-4">
                            {/* Gatekeeper Card */}
                            <div className="glass-panel p-4 rounded-xl border-l-4 border-l-primary">
                                <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Gatekeeper Assessment</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="block text-xs text-gray-500">Document Type</span>
                                        <span className="text-lg font-bold text-white">{result.gatekeeper.doc_type}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-500">Vendor</span>
                                        <span className="text-lg text-white">{result.gatekeeper.vendor_name || "Unknown"}</span>
                                    </div>
                                </div>
                                <p className="mt-3 text-sm text-gray-300 italic">"{result.gatekeeper.summary}"</p>
                            </div>

                            {/* Analyst Card */}
                            {result.analyst && (
                                <div className="glass-panel p-4 rounded-xl border-l-4 border-l-purple-500">
                                    <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Analyst Extraction</h3>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="block text-xs text-gray-500">Total Amount</span>
                                            <span className="text-2xl font-mono text-primary font-bold">
                                                {result.analyst.total_amount?.toLocaleString()} <span className="text-sm">{result.analyst.currency}</span>
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xs text-gray-500">Line Items</span>
                                            <span className="text-white font-mono">{result.analyst.line_items?.length} items extracted</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Line Items Table */}
                            {result.analyst && result.analyst.line_items && (
                                <LineItemsTable
                                    lineItems={result.analyst.line_items}
                                    currency={result.analyst.currency || "USD"}
                                    subtotal={result.analyst.subtotal || 0}
                                    taxAmount={result.analyst.tax_amount || 0}
                                    totalAmount={result.analyst.total_amount || 0}
                                />
                            )}

                            {/* Guardian Card */}
                            {result.guardian && (
                                <div className={`glass-panel p-4 rounded-xl border-l-4 ${result.guardian.status === 'PASS' ? 'border-l-success' : 'border-l-warning'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Guardian Audit</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${result.guardian.status === 'PASS' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                                            {result.guardian.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-300">{result.guardian.reasoning}</p>
                                    {result.guardian.flags && result.guardian.flags.length > 0 && (
                                        <ul className="mt-2 space-y-1">
                                            {result.guardian.flags.map((flag: string, i: number) => (
                                                <li key={i} className="flex items-center gap-2 text-xs text-warning">
                                                    <AlertTriangle className="w-3 h-3" /> {flag}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {/* Phase 2: Verification Card - AI Decision Summary */}
                            <VerificationCard
                                gatekeeperConfidence={result.gatekeeper?.confidence_score ?? 1}
                                docType={result.gatekeeper?.doc_type ?? "Unknown"}
                                guardianStatus={result.guardian?.status ?? "REVIEW"}
                                guardianFlags={result.guardian?.flags ?? []}
                                lineItemsCount={result.analyst?.line_items?.length ?? 0}
                                requiresHumanReview={requiresHumanReview}
                                piiDetected={result.guardian?.pii_detected}
                                fraudRiskScore={result.fraud?.risk_score ?? 0}
                                fraudSummary={result.fraud?.summary}
                            />

                            {/* Phase 2: Approval Panel - HITL Actions */}
                            <ApprovalPanel
                                approvalStatus={approvalStatus}
                                requiresHumanReview={requiresHumanReview}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onFlagForReview={handleFlagForReview}
                                isProcessing={status === 'processing'}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Audit Log Panel */}
            <AuditLogPanel
                auditLog={auditLog}
                onExport={exportAuditLog}
                onClear={clearAuditLog}
            />

            {/* Phase 3: Communication Panel - ACTION PHASE */}
            {result && approvalStatus === "approved" && (
                <div
                    ref={actionRef}
                    className={`phase-section ${currentPhase === "action" ? "phase-active" : ""}`}
                >
                    <CommunicationPanel
                        isVisible={true}
                        vendorName={result.gatekeeper?.vendor_name || "Unknown Vendor"}
                        documentRef={currentFilename || "Document"}
                        totalAmount={result.analyst?.total_amount || 0}
                        currency={result.analyst?.currency || "USD"}
                        lineItemsCount={result.analyst?.line_items?.length || 0}
                        onGenerateDraft={handleGenerateDraft}
                        drafts={drafts}
                        onApproveDraft={approveDraft}
                        onRejectDraft={rejectDraft}
                    />
                </div>
            )}
        </div>
    );
}
