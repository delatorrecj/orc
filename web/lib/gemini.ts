import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "").split(",").map(k => k.trim()).filter(Boolean);

if (apiKeys.length === 0) {
    console.warn("WARNING: GEMINI_API_KEYS is not set in environment variables.");
}

let keyIndex = 0;

function getRotatedModel() {
    if (apiKeys.length === 0) {
        throw new Error("No API keys configured");
    }

    // Rotate key index
    const currentKey = apiKeys[keyIndex];
    keyIndex = (keyIndex + 1) % apiKeys.length;

    const genAI = new GoogleGenerativeAI(currentKey);
    return genAI.getGenerativeModel({
        model: "models/gemini-2.5-flash",
        generationConfig: {
            temperature: 0.1,
        }
    });
}

// Proxy object to dynamically get a fresh model instance with a rotated key on each method call
export const model = new Proxy({} as any, {
    get: (_, prop) => {
        const instance = getRotatedModel();
        // @ts-expect-error dynamic proxy
        const value = instance[prop];
        return typeof value === 'function' ? value.bind(instance) : value;
    }
});
