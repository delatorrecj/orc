"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface LineItem {
    sku?: string;
    desc: string;
    qty: number;
    unit_price: number;
    total: number;
}

interface LineItemsTableProps {
    lineItems: LineItem[];
    currency: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
}

export function LineItemsTable({
    lineItems,
    currency,
    subtotal,
    taxAmount,
    totalAmount,
}: LineItemsTableProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatCurrency = (value: number) => {
        return value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    if (!lineItems || lineItems.length === 0) {
        return (
            <div className="glass-panel p-4 rounded-xl border-l-4 border-l-purple-500/50">
                <p className="text-gray-500 text-sm">No line items extracted.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel rounded-xl border-l-4 border-l-purple-500 overflow-hidden">
            {/* Collapsed Header / Toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-controls="line-items-content"
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer focus:outline-none focus:bg-white/10"
            >
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        Line Items
                    </span>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-mono">
                        {lineItems.length} items
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-white font-mono">
                        {formatCurrency(totalAmount)} <span className="text-gray-500 text-sm">{currency}</span>
                    </span>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </button>

            {/* Expanded Table */}
            <div
                id="line-items-content"
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="border-t border-white/10 overflow-x-auto">
                    <div className="min-w-[600px]">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-white/5 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-2">SKU</div>
                            <div className="col-span-4">Description</div>
                            <div className="col-span-2 text-right">Qty</div>
                            <div className="col-span-2 text-right">Unit Price</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        {/* Table Body */}
                        <div className="max-h-[300px] overflow-y-auto">
                            {lineItems.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors text-sm"
                                >
                                    <div className="col-span-2 font-mono text-gray-400">
                                        {item.sku || "—"}
                                    </div>
                                    <div className="col-span-4 text-white truncate" title={item.desc}>
                                        {item.desc}
                                    </div>
                                    <div className="col-span-2 text-right font-mono text-gray-300">
                                        {item.qty}
                                    </div>
                                    <div className="col-span-2 text-right font-mono text-gray-300">
                                        {formatCurrency(item.unit_price)}
                                    </div>
                                    <div className="col-span-2 text-right font-mono text-white">
                                        {formatCurrency(item.total)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Totals */}
                    <div className="border-t border-white/10 px-4 py-3 space-y-1 bg-white/5">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-mono text-gray-300">
                                {formatCurrency(subtotal)} {currency}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tax</span>
                            <span className="font-mono text-gray-300">
                                {formatCurrency(taxAmount)} {currency}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm font-bold pt-2 border-t border-white/10">
                            <span className="text-white">Total</span>
                            <span className="font-mono text-primary">
                                {formatCurrency(totalAmount)} {currency}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
