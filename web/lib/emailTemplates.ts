// Email draft types and template definitions for Phase 3 Communication Layer

export type EmailType = "inquiry" | "follow_up" | "negotiation" | "confirmation";

export interface EmailDraft {
    id: string;
    to: string;
    subject: string;
    body: string;
    type: EmailType;
    status: "draft" | "approved" | "sent" | "rejected";
    createdAt: string;
    metadata: {
        vendorName: string;
        documentRef: string;
        totalAmount: number;
        currency: string;
        lineItemsCount: number;
    };
}

// Email templates - used as context for Gemini generation
export const EMAIL_TEMPLATES: Record<EmailType, { name: string; description: string; subjectTemplate: string }> = {
    inquiry: {
        name: "Documentation Inquiry",
        description: "Request additional documentation or clarification from supplier",
        subjectTemplate: "Documentation Request - {documentRef}",
    },
    follow_up: {
        name: "Follow-Up Reminder",
        description: "Gentle reminder for pending responses or outstanding items",
        subjectTemplate: "Follow-Up: Pending Response Required - {documentRef}",
    },
    negotiation: {
        name: "Terms Discussion",
        description: "Initiate price or terms negotiation based on extracted data",
        subjectTemplate: "Regarding Terms and Pricing - {documentRef}",
    },
    confirmation: {
        name: "Receipt Confirmation",
        description: "Acknowledge receipt and approval of submitted documents",
        subjectTemplate: "Confirmation: Document Received - {documentRef}",
    },
};

// Prompt templates for Gemini to generate email bodies
export function getEmailPrompt(type: EmailType, metadata: EmailDraft["metadata"]): string {
    const baseContext = `
You are a professional procurement assistant drafting an email to a supplier.
Write in a professional but friendly tone. Keep emails concise and actionable.

Vendor: ${metadata.vendorName}
Document Reference: ${metadata.documentRef}
Total Amount: ${metadata.totalAmount.toLocaleString()} ${metadata.currency}
Line Items: ${metadata.lineItemsCount}
`;

    const typePrompts: Record<EmailType, string> = {
        inquiry: `
${baseContext}

Write an email requesting additional documentation or clarification.
- Ask for specific missing information
- Mention the document reference
- Provide a reasonable response timeframe (5 business days)
- Be professional and courteous
`,
        follow_up: `
${baseContext}

Write a gentle follow-up reminder email.
- Reference the original document/request
- Politely note the pending items
- Offer assistance if they need clarification
- Suggest a call if needed
`,
        negotiation: `
${baseContext}

Write an email to discuss pricing or terms.
- Acknowledge receipt of their document
- Express interest in discussing terms
- Be diplomatic and open to discussion
- Suggest a meeting or call to discuss further
`,
        confirmation: `
${baseContext}

Write a confirmation email acknowledging receipt and approval.
- Confirm you received and reviewed their document
- Mention the approval status
- Outline any next steps
- Thank them for their business
`,
    };

    return typePrompts[type];
}

// Generate a unique ID for email drafts
export function generateEmailId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create subject line from template
export function generateSubject(type: EmailType, documentRef: string): string {
    return EMAIL_TEMPLATES[type].subjectTemplate.replace("{documentRef}", documentRef);
}
