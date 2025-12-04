import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function checkModelQuality(thumbnailUrl: string) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY not found, skipping QA");
            return null;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Fetch image
        const imageResp = await fetch(thumbnailUrl);
        const imageBuffer = await imageResp.arrayBuffer();

        const prompt = "Analyze this 3D model preview. Is it a high-quality representation of a product? Rate it 1-10 and give a brief reason. Return JSON format: { rating: number, reason: string }";

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: Buffer.from(imageBuffer).toString("base64"),
                    mimeType: "image/png", // Meshy usually returns PNG thumbnails
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini QA Error:", error);
        return null;
    }
}
