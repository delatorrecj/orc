"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";

interface ExportDropdownProps {
    data: {
        gatekeeper?: {
            doc_type?: string;
            vendor_name?: string;
            confidence_score?: number;
            summary?: string;
        };
        analyst?: {
            line_items?: Array<{
                sku?: string;
                desc?: string;
                description?: string;
                qty?: number;
                quantity?: number;
                unit_price?: number;
                unitPrice?: number;
                total?: number;
                [key: string]: unknown;
            }>;
            currency?: string;
            subtotal?: number;
            tax_amount?: number;
            total_amount?: number;
            [key: string]: unknown;
        };
        guardian?: unknown;
    };
}

export function ExportDropdown({ data }: ExportDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getTimestamp = () => {
        return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    };

    const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsOpen(false);
    };

    const exportAsJSON = () => {
        const jsonContent = JSON.stringify(data, null, 2);
        downloadFile(jsonContent, `orc_extraction_${getTimestamp()}.json`, "application/json");
    };

    const exportAsCSV = () => {
        const lineItems = data.analyst?.line_items || [];
        const currency = data.analyst?.currency || "USD";

        // CSV Header
        const headers = ["SKU", "Description", "Quantity", "Unit Price", "Total", "Currency"];

        // CSV Rows - handle various possible field names from AI
        const rows = lineItems.map((item: any) => [
            item.sku || item.SKU || item.product_code || item.item_code || "",
            `"${(item.desc || item.description || item.name || item.item_description || "").replace(/"/g, '""')}"`,
            (item.qty || item.quantity || item.amount || 0).toString(),
            (item.unit_price || item.unitPrice || item.price || 0).toFixed(2),
            (item.total || item.line_total || item.extended_price || (item.qty || 0) * (item.unit_price || 0)).toFixed(2),
            currency,
        ]);

        // Add document info header
        rows.unshift([]);
        rows.unshift(["Document Type", data.gatekeeper?.doc_type || "Unknown", "", "", "", ""]);
        rows.unshift(["Vendor", data.gatekeeper?.vendor_name || "Unknown", "", "", "", ""]);
        rows.unshift(["Exported", new Date().toLocaleString(), "", "", "", ""]);
        rows.unshift([]);

        // Add summary section
        rows.push([]);
        rows.push(["", "", "", "Subtotal", (data.analyst?.subtotal || 0).toFixed(2), currency]);
        rows.push(["", "", "", "Tax", (data.analyst?.tax_amount || 0).toFixed(2), currency]);
        rows.push(["", "", "", "Total", (data.analyst?.total_amount || 0).toFixed(2), currency]);

        const csvContent = [headers.join(","), ...rows.map((row) => (Array.isArray(row) ? row.join(",") : ""))].join("\n");
        downloadFile(csvContent, `orc_line_items_${getTimestamp()}.csv`, "text/csv");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg transition-colors cursor-pointer"
            >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-panel rounded-lg border border-white/10 shadow-xl z-50 overflow-hidden">
                    <button
                        onClick={exportAsJSON}
                        className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2"
                    >
                        <span className="w-8 h-5 bg-warning/20 text-warning text-[10px] font-bold rounded flex items-center justify-center">
                            JSON
                        </span>
                        Full Extraction
                    </button>
                    <button
                        onClick={exportAsCSV}
                        className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2 border-t border-white/5"
                    >
                        <span className="w-8 h-5 bg-success/20 text-success text-[10px] font-bold rounded flex items-center justify-center">
                            CSV
                        </span>
                        Line Items Only
                    </button>
                </div>
            )}
        </div>
    );
}
