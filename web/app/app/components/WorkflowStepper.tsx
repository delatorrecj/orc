"use client";

import { Zap, Cog, Eye, Send, Check } from "lucide-react";
import type { WorkflowPhase } from "@/hooks/useOrchestrator";

interface WorkflowStepperProps {
    currentPhase: WorkflowPhase;
    onPhaseClick?: (phase: WorkflowPhase) => void;
}

const phases: { id: WorkflowPhase; label: string; icon: React.ReactNode }[] = [
    { id: "intake", label: "Intake", icon: <Zap className="w-4 h-4" /> },
    { id: "processing", label: "Process", icon: <Cog className="w-4 h-4" /> },
    { id: "review", label: "Review", icon: <Eye className="w-4 h-4" /> },
    { id: "action", label: "Action", icon: <Send className="w-4 h-4" /> },
];

const phaseOrder: WorkflowPhase[] = ["intake", "processing", "review", "action"];

function getPhaseStatus(phase: WorkflowPhase, currentPhase: WorkflowPhase): "completed" | "active" | "pending" {
    const currentIndex = phaseOrder.indexOf(currentPhase);
    const phaseIndex = phaseOrder.indexOf(phase);

    if (phaseIndex < currentIndex) return "completed";
    if (phaseIndex === currentIndex) return "active";
    return "pending";
}

export function WorkflowStepper({ currentPhase, onPhaseClick }: WorkflowStepperProps) {
    return (
        <div className="glass-panel rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
                {phases.map((phase, index) => {
                    const status = getPhaseStatus(phase.id, currentPhase);
                    const isLast = index === phases.length - 1;

                    return (
                        <div key={phase.id} className={`flex items-center ${!isLast ? "flex-1" : ""}`}>
                            {/* Phase Node */}
                            <button
                                onClick={() => onPhaseClick?.(phase.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
                                    ${status === "active"
                                        ? "bg-primary/20 text-primary border border-primary/40 shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-pulse"
                                        : status === "completed"
                                            ? "bg-success/10 text-success border border-success/20"
                                            : "bg-white/5 text-gray-500 border border-white/5"
                                    }
                                    ${onPhaseClick ? "cursor-pointer hover:scale-105" : "cursor-default"}
                                `}
                                disabled={!onPhaseClick}
                            >
                                {/* Status Indicator */}
                                <div className={`
                                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                                    ${status === "active"
                                        ? "bg-primary text-white"
                                        : status === "completed"
                                            ? "bg-success text-white"
                                            : "bg-white/10 text-gray-400"
                                    }
                                `}>
                                    {status === "completed" ? (
                                        <Check className="w-3 h-3" />
                                    ) : (
                                        phase.icon
                                    )}
                                </div>

                                {/* Label */}
                                <span className={`
                                    text-sm font-medium hidden sm:block
                                    ${status === "active" ? "text-primary" : status === "completed" ? "text-success" : "text-gray-500"}
                                `}>
                                    {phase.label}
                                </span>
                            </button>

                            {/* Connector Line */}
                            {!isLast && (
                                <div className="flex-1 h-px mx-2 relative">
                                    <div className={`
                                        absolute inset-0 transition-colors duration-500
                                        ${status === "completed" ? "bg-success/50" : "bg-white/10"}
                                    `} />
                                    {status === "active" && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-transparent animate-pulse" />
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Phase Description */}
            <div className="mt-3 text-center">
                <p className="text-xs text-gray-400">
                    {currentPhase === "intake" && "Drop a supply chain document to begin orchestration"}
                    {currentPhase === "processing" && "AI agents are analyzing your document..."}
                    {currentPhase === "review" && "Review extraction results and make a decision"}
                    {currentPhase === "action" && "Document approved — take follow-up actions"}
                </p>
            </div>
        </div>
    );
}
