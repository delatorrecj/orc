"use client";

import { useState, useCallback, useRef } from "react";
import { UploadCloud, File as FileIcon, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DropzoneProps {
    onFileSelect: (file: File) => void;
    isProcessing: boolean;
}

export function Dropzone({ onFileSelect, isProcessing }: DropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleClick = () => {
        if (!isProcessing) {
            inputRef.current?.click();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isProcessing && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            inputRef.current?.click();
        }
    };

    const handleFile = (selectedFile: File) => {
        setFile(selectedFile);
        onFileSelect(selectedFile);
    };

    const reset = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <section className="relative group w-full mb-8">
            {/* Ambient Background Glow */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-2xl opacity-20 blur transition duration-1000 ${isDragging ? "opacity-60 scale-105" : "group-hover:opacity-40"}`} />

            <div
                onClick={!isProcessing ? handleClick : undefined}
                onKeyDown={!isProcessing ? handleKeyDown : undefined}
                onDragOver={!isProcessing ? handleDragOver : undefined}
                onDragLeave={!isProcessing ? handleDragLeave : undefined}
                onDrop={!isProcessing ? handleDrop : undefined}
                role="button"
                tabIndex={!isProcessing ? 0 : -1}
                aria-label="Upload document dropzone"
                aria-disabled={isProcessing}
                className={`
            relative h-64 bg-surface/50 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center 
            border-2 transition-all duration-300 overflow-hidden outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface
            ${isDragging
                        ? "border-primary bg-primary/10 scale-[1.02]"
                        : "border-dashed border-white/20 hover:border-primary/50 cursor-pointer"
                    }
            ${isProcessing ? "cursor-default border-solid" : ""}
        `}
            >
                <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    accept=".pdf,.csv,.json,.png,.jpg"
                />

                <AnimatePresence mode="wait">
                    {!isProcessing && !file && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center pointer-events-none"
                        >
                            <div className={`
                        w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform duration-500
                        ${isDragging ? "scale-125 bg-primary text-black" : "bg-surface-highlight text-primary group-hover:scale-110"}
                    `}>
                                <UploadCloud className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight">Event Horizon Intake</h3>
                            <p className="text-gray-400 mt-2 text-center max-w-md">
                                {isDragging ? "Release to initiate integration sequence." : "Drag supply chain documents here, or click to browse."}
                            </p>
                            <div className="mt-6 flex gap-2">
                                {['PDF', 'CSV', 'JSON', 'IMG'].map((type) => (
                                    <span key={type} className="text-[10px] font-bold font-mono text-gray-500 bg-black/40 px-3 py-1.5 rounded border border-white/5">
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {isProcessing && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 border-4 border-primary/30 rounded-full" />
                                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <Sparkles className="absolute inset-0 m-auto text-primary w-8 h-8 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">Analyzing Quantum Structure...</h3>
                            <p className="text-sm font-mono text-primary/80">{file?.name}</p>
                        </motion.div>
                    )}

                    {!isProcessing && file && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mb-4 border border-success/50">
                                <FileIcon className="w-10 h-10 text-success" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">File Ready</h3>
                            <p className="text-gray-400 mb-6 font-mono text-sm">{file?.name}</p>
                            <button
                                onClick={reset}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Change File
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
