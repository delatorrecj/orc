import { z } from "zod";

// --- GATEKEEPER ---
export const GatekeeperSchema = z.object({
    doc_type: z.enum(["Invoice", "Purchase_Order", "Chat_Log", "Email", "Unknown"]),
    vendor_name: z.string().optional().describe("Best guess of vendor name"),
    confidence_score: z.number().min(0).max(1),
    summary: z.string().describe("One sentence summary of content"),
});

// --- ANALYST ---
export const LineItemSchema = z.object({
    sku: z.string().optional(),
    desc: z.string(),
    qty: z.number(),
    unit_price: z.number(),
    total: z.number(),
});

export const AnalystSchema = z.object({
    po_number: z.string().optional(),
    invoice_date: z.string().describe("YYYY-MM-DD format"),
    vendor_details: z.object({
        name: z.string(),
        address: z.string().optional(),
    }),
    line_items: z.array(LineItemSchema),
    subtotal: z.number(),
    tax_amount: z.number(),
    total_amount: z.number(),
    currency: z.string().length(3),
});

// --- GUARDIAN ---
export const GuardianSchema = z.object({
    status: z.enum(["PASS", "REVIEW", "REJECT"]),
    flags: z.array(z.string()).describe("List of warning messages"),
    reasoning: z.string().describe("Explanation for the status"),
    confidence_score: z.number().min(0).max(1).optional().describe("Overall extraction confidence"),
    requires_human_review: z.boolean().optional().describe("True if human approval is required"),
    pii_detected: z.boolean().optional().describe("True if PII was found in document"),
});

// --- CONFIDENCE THRESHOLD ---
export const CONFIDENCE_THRESHOLD = 0.90; // 90% minimum for auto-approval

export type GatekeeperOutput = z.infer<typeof GatekeeperSchema>;
export type AnalystOutput = z.infer<typeof AnalystSchema>;
export type GuardianOutput = z.infer<typeof GuardianSchema>;
