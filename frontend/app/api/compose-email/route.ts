import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini";
import { getEmailPrompt, generateSubject, generateEmailId, type EmailType } from "@/lib/emailTemplates";

// API route for generating email drafts using Gemini

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { type, metadata } = body as {
            type: EmailType;
            metadata: {
                vendorName: string;
                documentRef: string;
                totalAmount: number;
                currency: string;
                lineItemsCount: number;
                vendorEmail?: string;
            };
        };

        if (!type || !metadata) {
            return NextResponse.json(
                { error: "Missing required fields: type and metadata" },
                { status: 400 }
            );
        }

        // Get the prompt for this email type
        const prompt = getEmailPrompt(type, metadata);

        console.log(`[EmailComposer] Generating ${type} email for ${metadata.vendorName}`);

        // Generate email body using Gemini
        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `${prompt}

Generate ONLY the email body text. Do not include subject line, sender, or recipient headers. Start directly with the greeting (e.g., "Dear [Vendor Name]," or "Hello,").

Keep the email professional, concise (under 200 words), and actionable.`
                        }
                    ]
                }
            ]
        });

        const emailBody = result.response.text().trim();

        if (!emailBody) {
            throw new Error("Failed to generate email content");
        }

        // Create the draft object
        const draft = {
            id: generateEmailId(),
            to: metadata.vendorEmail || `${metadata.vendorName.toLowerCase().replace(/\s+/g, ".")}@supplier.com`,
            subject: generateSubject(type, metadata.documentRef),
            body: emailBody,
            type,
            status: "draft" as const,
            createdAt: new Date().toISOString(),
            metadata: {
                vendorName: metadata.vendorName,
                documentRef: metadata.documentRef,
                totalAmount: metadata.totalAmount,
                currency: metadata.currency,
                lineItemsCount: metadata.lineItemsCount,
            },
        };

        console.log(`[EmailComposer] Draft generated successfully: ${draft.id}`);

        return NextResponse.json({ draft });

    } catch (error: any) {
        console.error("[EmailComposer] Generation failed:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate email draft" },
            { status: 500 }
        );
    }
}
