"use client";

import { Upload, Zap, Lock } from "lucide-react";

export type IntakeMode = "manual" | "automated";

interface ModeSelectorProps {
    mode: IntakeMode;
    onModeChange: (mode: IntakeMode) => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
    return (
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
            {/* Manual Mode */}
            <button
                onClick={() => onModeChange("manual")}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                    ${mode === "manual"
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                    cursor-pointer
                `}
            >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Manual</span>
            </button>

            {/* Automated Mode */}
            <button
                onClick={() => onModeChange("automated")}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                    ${mode === "automated"
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }
                    cursor-pointer relative
                `}
            >
                <Zap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Automated</span>

                {/* Coming Soon Badge */}
                {mode !== "automated" && (
                    <span className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 bg-warning/20 text-warning text-[10px] font-bold rounded-full border border-warning/30">
                        <Lock className="w-2.5 h-2.5" />
                        Soon
                    </span>
                )}
            </button>
        </div>
    );
}
