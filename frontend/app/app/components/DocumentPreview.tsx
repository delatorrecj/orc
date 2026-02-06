"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure worker
// Configure worker
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface GroundingItem {
    text: string;
    bbox: number[]; // [x0, top, x1, bottom]
    page: number;
    type: string;
}

interface DocumentPreviewProps {
    fileUrl: string | null;
    grounding?: {
        items: GroundingItem[];
        page_dimensions: Record<number, { width: number; height: number }>;
    };
}

export function DocumentPreview({ fileUrl, grounding }: DocumentPreviewProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [showOverlay, setShowOverlay] = useState<boolean>(true);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Measure container width for responsive PDF scaling
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth - 32);
            }
        };
        updateWidth();
        window.addEventListener("resize", updateWidth);
        return () => window.removeEventListener("resize", updateWidth);
    }, []);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    // Filter boxes for current page
    const currentBoxes = useMemo(() => {
        if (!grounding) return [];
        return grounding.items.filter((item) => item.page === pageNumber);
    }, [grounding, pageNumber]);

    // Get current page dimensions
    const pageDims = grounding?.page_dimensions?.[pageNumber];

    return (
        <div ref={containerRef} className="glass-panel p-4 rounded-xl flex flex-col h-[600px] w-full items-center relative overflow-hidden group">
            {!fileUrl ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                    No document loaded
                </div>
            ) : (
                <>
                    {/* Toolbar */}
                    <div className="flex items-center justify-between w-full mb-4 px-2 z-10">
                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-lg p-1">
                            <button
                                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                                disabled={pageNumber <= 1}
                                className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 text-white" />
                            </button>
                            <span className="text-xs font-mono text-white px-2">
                                Page {pageNumber} / {numPages || "-"}
                            </span>
                            <button
                                onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                                disabled={pageNumber >= numPages}
                                className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 text-white" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-lg p-1">
                            <button
                                onClick={() => setShowOverlay(!showOverlay)}
                                className={`px-2 py-1 text-xs rounded transition-colors font-bold ${showOverlay ? "bg-primary text-black" : "text-white hover:bg-white/10"
                                    }`}
                            >
                                {showOverlay ? "Hide AI View" : "Show AI View"}
                            </button>
                            <div className="w-px h-4 bg-white/20" />
                            <button
                                onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                                className="p-1 hover:bg-white/10 rounded"
                            >
                                <ZoomOut className="w-4 h-4 text-white" />
                            </button>
                            <span className="text-xs font-mono text-white w-8 text-center">
                                {Math.round(scale * 100)}%
                            </span>
                            <button
                                onClick={() => setScale((s) => Math.min(2.0, s + 0.1))}
                                className="p-1 hover:bg-white/10 rounded"
                            >
                                <ZoomIn className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* PDF Container */}
                    <div className="flex-1 w-full overflow-auto flex justify-center bg-black/20 rounded-lg relative scrollbar-thin">
                        <Document
                            file={fileUrl}
                            onLoadSuccess={onDocumentLoadSuccess}
                            className="flex justify-center"
                            loading={
                                <div className="flex flex-col items-center justify-center p-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <span className="mt-2 text-sm text-gray-400">Loading PDF...</span>
                                </div>
                            }
                        >
                            <div className="relative">
                                <Page
                                    pageNumber={pageNumber}
                                    width={containerWidth > 0 ? containerWidth * scale : undefined}
                                    className="shadow-2xl"
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />

                                {/* Grounding Overlay */}
                                {showOverlay && pageDims && currentBoxes.map((box, idx) => {
                                    // Calculate relative positions
                                    // bbox: [x0, top, x1, bottom]
                                    const width = box.bbox[2] - box.bbox[0];
                                    const height = box.bbox[3] - box.bbox[1];

                                    const leftPct = (box.bbox[0] / pageDims.width) * 100;
                                    const topPct = (box.bbox[1] / pageDims.height) * 100;
                                    const widthPct = (width / pageDims.width) * 100;
                                    const heightPct = (height / pageDims.height) * 100;

                                    return (
                                        <div
                                            key={idx}
                                            className="absolute border border-primary/50 bg-primary/10 hover:bg-primary/30 transition-colors cursor-crosshair group-box"
                                            style={{
                                                left: `${leftPct}%`,
                                                top: `${topPct}%`,
                                                width: `${widthPct}%`,
                                                height: `${heightPct}%`,
                                            }}
                                            title={`${box.type}: ${box.text}`}
                                        >
                                            {/* Tooltip on hover */}
                                            <div className="hidden group-box-hover:block absolute -top-8 left-0 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
                                                {box.text.substring(0, 30)}...
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Document>
                    </div>
                </>
            )}
        </div>
    );
}
