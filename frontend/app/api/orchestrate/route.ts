// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/gemini";
import { GatekeeperSchema, AnalystSchema, GuardianSchema } from "@/lib/schemas";
import type { GatekeeperOutput, AnalystOutput, GuardianOutput } from "@/lib/schemas";
import { SchemaType } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// --- PROMPT ENGINE LOADER ---
const loadPromptEngine = () => {
    try {
        // Try to locate the file relative to the storage (web folder context)
        // In local dev, valid path is usually ../orc_prompt_engine.json
        const possiblePaths = [
            path.join(process.cwd(), "..", "orc_prompt_engine.json"),
            path.join(process.cwd(), "orc_prompt_engine.json"), // Fallback if moved
            path.join(process.cwd(), "data", "orc_prompt_engine.json") // Fallback
        ];

        for (const p of possiblePaths) {
            if (fs.existsSync(p)) {
                console.log(`[System] Loaded Prompt Engine from: ${p}`);
                const content = fs.readFileSync(p, "utf8");
                return JSON.parse(content);
            }
        }
        console.warn("[System] Prompt Engine not found. Using Fallback defaults.");
        return null;
    } catch (e) {
        console.error("[System] Failed to load Prompt Engine:", e);
        return null;
    }
};

const PROMPT_ENGINE = loadPromptEngine();

const cleanJson = (text: string) => {
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert to Base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString("base64");
        const filePart = {
            inlineData: {
                data: base64Data,
                mimeType: file.type,
            },
        };

        // --- STEP 1: GATEKEEPER ---
        console.log(">>> [Gatekeeper] Scanning...");
        let gkParsed: GatekeeperOutput | null = null;

        try {
            // Construct Prompt from Engine or Fallback
            const agentConfig = PROMPT_ENGINE?.agents?.GATEKEEPER;
            const gkPrompt = agentConfig
                ? `
                   ROLE: ${agentConfig.role}
                   INSTRUCTION: ${agentConfig.instruction}
                   OUTPUT SCHEMA (Strict JSON): ${JSON.stringify(agentConfig.output_schema)}
                  `
                : `
                   ROLE: Universal Document Classifier
                   INSTRUCTION: Identify what this document IS. Extract raw text content summary.
                   OUTPUT SCHEMA: JSON matching { doc_type, vendor_name, confidence_score, summary }
                  `;

            const gkResult = await model.generateContent({
                contents: [{ role: "user", parts: [filePart, { text: gkPrompt }] }]
            } as any);

            const text = cleanJson(gkResult.response.text());
            const gkData = JSON.parse(text);
            gkParsed = GatekeeperSchema.parse(gkData);

        } catch (e: unknown) {
            console.error("[Gatekeeper] Failed:", e);
            const err = e instanceof Error ? e.message : "Unknown Gatekeeper Error";
            return NextResponse.json({ error: `Gatekeeper Failed: ${err}` }, { status: 422 });
        }


        let analystParsed: AnalystOutput | null = null;
        let guardianParsed: GuardianOutput | null = null;

        // --- STEP 2: ANALYST (Conditional) ---
        if (gkParsed && ["Invoice", "Purchase_Order"].includes(gkParsed.doc_type)) {
            try {
                console.log(">>> [Analyst] Extracting...");

                const agentConfig = PROMPT_ENGINE?.agents?.ANALYST;
                const analystPrompt = agentConfig
                    ? `
                       ROLE: ${agentConfig.role}
                       INSTRUCTION: ${agentConfig.instruction}
                       FIELDS TO EXTRACT: ${JSON.stringify(agentConfig.fields_to_extract)}
                       LOGIC: ${agentConfig.logic}
                      `
                    : `
                       ROLE: Supply Chain Data Extractor
                       INSTRUCTION: Extract entities (PO#, Date, Vendor, Totals). Normalize Dates to YYYY-MM-DD.
                      `;

                const analystResult = await model.generateContent({
                    contents: [{ role: "user", parts: [filePart, { text: analystPrompt }] }]
                } as any);

                const text = cleanJson(analystResult.response.text());
                const analystJson = JSON.parse(text);
                analystParsed = AnalystSchema.parse(analystJson);

                // --- STEP 3: GUARDIAN ---
                console.log(">>> [Guardian] Validating...");

                const gConfig = PROMPT_ENGINE?.agents?.GUARDIAN;
                const guardianPrompt = gConfig
                    ? `
                       ROLE: ${gConfig.role}
                       INSTRUCTION: ${gConfig.instruction}
                       CHECKS: ${JSON.stringify(gConfig.checks)}
                       OUTPUT SCHEMA: ${JSON.stringify(gConfig.output_schema)}
                       CONTEXT: 
                       Gatekeeper: ${JSON.stringify(gkParsed)}
                       Analyst: ${JSON.stringify(analystParsed)}
                      `
                    : `
                        ROLE: Compliance & Safety Officer
                        INSTRUCTION: Check for PII, Math Errors, and Suspicious Values.
                        CONTEXT: 
                        Gatekeeper: ${JSON.stringify(gkParsed)}
                        Analyst: ${JSON.stringify(analystParsed)}
                      `;

                const guardianResult = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: guardianPrompt }] }]
                });

                const gText = cleanJson(guardianResult.response.text());
                guardianParsed = GuardianSchema.parse(JSON.parse(gText));

            } catch (e: unknown) {
                console.error("[Analyst/Guardian] Failed:", e);
                // Non-fatal error for pipeline, return partial results
            }
        } else {
            console.log(">>> [Analyst] Skipped (Doc Type not relevant)");
        }

        return NextResponse.json({
            gatekeeper: gkParsed,
            analyst: analystParsed,
            guardian: guardianParsed
        });

    } catch (error: unknown) {
        console.error("Orchestration Error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Internal Server Error" },
            { status: 500 }
        );
    }
}
