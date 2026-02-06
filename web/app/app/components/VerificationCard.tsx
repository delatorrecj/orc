"use client";

import { Shield, AlertTriangle, CheckCircle, XCircle, Eye, Fingerprint } from "lucide-react";
import { CONFIDENCE_THRESHOLD } from "@/lib/schemas";

interface VerificationCardProps {
    gatekeeperConfidence: number;
    docType: string;
    guardianStatus: "PASS" | "REVIEW" | "REJECT";
    guardianFlags: string[];
    lineItemsCount: number;
    requiresHumanReview: boolean;
    piiDetected?: boolean;
    fraudRiskScore?: number;
    fraudSummary?: string;
}

export function VerificationCard({
    gatekeeperConfidence,
    docType,
    guardianStatus,
    guardianFlags,
    lineItemsCount,
    requiresHumanReview,
    piiDetected = false,
    fraudRiskScore = 0,
    fraudSummary,
}: VerificationCardProps) {
    const confidencePercent = Math.round(gatekeeperConfidence * 100);
    const meetsThreshold = gatekeeperConfidence >= CONFIDENCE_THRESHOLD;

    const getStatusIcon = () => {
        if (guardianStatus === "PASS" && meetsThreshold) {
            return <CheckCircle className="w-5 h-5 text-success" />;
        } else if (guardianStatus === "REJECT") {
            return <XCircle className="w-5 h-5 text-critical" />;
        }
        return <Eye className="w-5 h-5 text-warning" />;
    };

    const getStatusColor = () => {
        if (guardianStatus === "PASS" && meetsThreshold) return "border-l-success";
        if (guardianStatus === "REJECT") return "border-l-critical";
        return "border-l-warning";
    };

    const getConfidenceBarColor = () => {
        if (confidencePercent >= 90) return "bg-success";
        if (confidencePercent >= 70) return "bg-warning";
        return "bg-critical";
    };

    const getFraudRiskColor = () => {
        if (fraudRiskScore >= 60) return { bg: "bg-critical", text: "text-critical", label: "HIGH" };
        if (fraudRiskScore >= 30) return { bg: "bg-warning", text: "text-warning", label: "MEDIUM" };
        return { bg: "bg-success", text: "text-success", label: "LOW" };
    };

    const fraudColors = getFraudRiskColor();

    return (
        <div className={`glass-panel rounded-xl border-l-4 ${getStatusColor()} overflow-hidden`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        AI Decision Summary
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className={`text-sm font-mono ${guardianStatus === "PASS" && meetsThreshold
                        ? "text-success"
                        : guardianStatus === "REJECT"
                            ? "text-critical"
                            : "text-warning"
                        }`}>
                        {requiresHumanReview ? "REQUIRES REVIEW" : "AUTO-APPROVE ELIGIBLE"}
                    </span>
                </div>
            </div>

            {/* Content Grid */}
            <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Confidence Score */}
                <div className="space-y-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                        Gatekeeper Confidence
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${getConfidenceBarColor()} transition-all duration-500`}
                                style={{ width: `${confidencePercent}%` }}
                            />
                        </div>
                        <span className={`text-sm font-mono font-bold ${meetsThreshold ? "text-success" : "text-warning"}`}>
                            {confidencePercent}%
                        </span>
                    </div>
                    {!meetsThreshold && (
                        <p className="text-xs text-warning">Below {Math.round(CONFIDENCE_THRESHOLD * 100)}% threshold</p>
                    )}
                </div>

                {/* Document Type */}
                <div className="space-y-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                        Document Type
                    </span>
                    <p className="text-white font-medium">{docType}</p>
                    <p className="text-xs text-gray-400">
                        {meetsThreshold ? "High Confidence" : "Low Confidence"}
                    </p>
                </div>

                {/* Extraction Quality */}
                <div className="space-y-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                        Extraction Quality
                    </span>
                    <p className="text-white font-medium font-mono">{lineItemsCount} line items</p>
                    <p className="text-xs text-gray-400">Fields parsed successfully</p>
                </div>

                {/* Guardian Status */}
                <div className="space-y-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                        Guardian Status
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${guardianStatus === "PASS"
                            ? "bg-success/20 text-success"
                            : guardianStatus === "REJECT"
                                ? "bg-critical/20 text-critical"
                                : "bg-warning/20 text-warning"
                            }`}>
                            {guardianStatus}
                        </span>
                        {piiDetected && (
                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-critical/20 text-critical">
                                PII
                            </span>
                        )}
                    </div>
                </div>

                {/* Fraud Risk Score */}
                <div className="space-y-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <Fingerprint className="w-3 h-3" />
                        Fraud Risk
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${fraudColors.bg} transition-all duration-500`}
                                style={{ width: `${fraudRiskScore}%` }}
                            />
                        </div>
                        <span className={`text-sm font-mono font-bold ${fraudColors.text}`}>
                            {fraudRiskScore}
                        </span>
                    </div>
                    <p className={`text-xs ${fraudColors.text}`}>
                        {fraudColors.label} Risk
                    </p>
                </div>
            </div>

            {/* Flags Section */}
            {guardianFlags.length > 0 && (
                <div className="px-4 pb-4">
                    <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-warning" />
                            <span className="text-xs font-bold text-warning uppercase">
                                {guardianFlags.length} Flag{guardianFlags.length > 1 ? "s" : ""} Raised
                            </span>
                        </div>
                        <ul className="space-y-1">
                            {guardianFlags.map((flag, i) => (
                                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                                    <span className="text-warning mt-1">•</span>
                                    {flag}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
