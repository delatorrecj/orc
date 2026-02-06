"use client";

import { Activity, Shield, FileSearch, Terminal, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// Importing types from hook location would be ideal, but for now we can duplicate or just reference the interface.
// To keep components independent, I'll define the interface here matching the hook's structure.

type LogType = "info" | "success" | "warning" | "error" | "processing";

interface LogEntry {
    id: string;
    agent: "SYSTEM" | "GATEKEEPER" | "ANALYST" | "GUARDIAN" | "HUMAN";
    message: string;
    timestamp: string;
    type: LogType;
}

interface ActivityFeedProps {
    logs: LogEntry[];
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-white/10">
                <Activity className="w-4 h-4 text-primary animate-pulse" /> Agent Activity Stream
            </div>

            <div className="space-y-2 h-[400px] overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-primary/20">
                <AnimatePresence initial={false} mode="popLayout">
                    {/* Reverse logs to show newest at top if passed that way, or just list them. 
                        Usually logs accumulate. Let's assume passed in order [newest, ...oldest] or we map them. 
                        If hook appends using [newLog, ...prev], then index 0 is newest. Perfect. 
                    */}
                    {logs.length === 0 && (
                        <div className="text-gray-500 text-sm font-mono text-center py-10 opacity-50">
                            Create a connection to begin stream...
                        </div>
                    )}
                    {logs.map((log) => (
                        <LogItem key={log.id} log={log} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

function LogItem({ log }: { log: LogEntry }) {
    const colors = {
        info: "text-blue-400 border-blue-400/20 bg-blue-400/10",
        success: "text-emerald-400 border-emerald-400/20 bg-emerald-400/10",
        warning: "text-amber-400 border-amber-400/20 bg-amber-400/10",
        error: "text-red-400 border-red-400/20 bg-red-400/10",
        processing: "text-purple-400 border-purple-400/20 bg-purple-400/10"
    };

    const icons = {
        SYSTEM: <Terminal className="w-3 h-3" />,
        GATEKEEPER: <FileSearch className="w-3 h-3" />,
        ANALYST: <Activity className="w-3 h-3" />,
        GUARDIAN: <Shield className="w-3 h-3" />,
        HUMAN: <User className="w-3 h-3" />,
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`p-3 rounded-lg border text-xs font-mono backdrop-blur-sm ${colors[log.type]} border-l-4`}
        >
            <div className="flex justify-between items-center mb-1 opacity-80">
                <div className="flex items-center gap-2 font-bold">
                    {icons[log.agent]}
                    {log.agent}
                </div>
                <span className="text-[10px] tracking-widest opacity-60">{log.timestamp}</span>
            </div>
            <div className="pl-5 leading-relaxed">
                {log.message}
            </div>
        </motion.div>
    );
}
