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
        // Intercept generateContent to handle 429 retries
        if (prop === 'generateContent') {
            return async (...args: unknown[]) => {
                let lastError;
                // Retry up to 3 times (or number of keys * 2 to be safe)
                const maxRetries = Math.max(apiKeys.length * 2, 5);

                for (let i = 0; i < maxRetries; i++) {
                    try {
                        const instance = getRotatedModel(); // Rotates key globally
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        return await (instance.generateContent as any)(...args);
                    } catch (err: unknown) {
                        const error = err as { message?: string; status?: number };
                        const isRateLimit = error.message?.includes('429') || error.message?.includes('Quota') || error.status === 429;

                        if (isRateLimit) {
                            console.warn(`[Gemini] Rate Limit hit on Key index ${keyIndex}. Rotating... (Attempt ${i + 1}/${maxRetries})`);
                            lastError = err;
                            // Add a small backoff to prevent hammering
                            await new Promise(r => setTimeout(r, 1000 + (i * 500)));
                            continue;
                        }
                        throw err; // Rethrow non-rate-limit errors
                    }
                }
                console.error("[Gemini] All keys exhausted/rate limited.");
                throw lastError;
            };
        }

        const instance = getRotatedModel();
        // @ts-expect-error dynamic proxy
        const value = instance[prop];
        return typeof value === 'function' ? value.bind(instance) : value;
    }
});
