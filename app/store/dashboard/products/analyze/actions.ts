"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

const SYSTEM_PROMPT = `
You are an expert fashion product tagger.
Analyze the image and extract the following details in strict JSON format:
{
  "color": "Dominant color (e.g. Red, Blue, Black)",
  "style": "Style category (e.g. Running, Casual, Boot, Sneaker)",
  "features": ["Feature 1", "Feature 2", "Feature 3"]
}
Rules:
- "color": Use simple, standard color names.
- "style": Choose the most specific style that applies.
- "features": List 3-5 distinct visual features (e.g. "Mesh upper", "White sole", "Logo print").
`;

export async function analyzeProductImage(productId: string, imageUrl: string) {
    try {
        if (!productId || !imageUrl) {
            throw new Error("Missing productId or imageUrl");
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

        // Fetch image data
        const imageResp = await fetch(imageUrl);
        if (!imageResp.ok) throw new Error("Failed to fetch image");
        const imageBuffer = await imageResp.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString("base64");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash", // Use a vision-capable model
            generationConfig: { responseMimeType: "application/json" },
        });

        const result = await model.generateContent([
            SYSTEM_PROMPT,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg", // Assuming JPEG for simplicity, or detect from headers
                },
            },
        ]);

        const text = result.response.text();
        const data = JSON.parse(text);

        // Update product in DB
        await prisma.product.update({
            where: { id: productId },
            data: {
                color: data.color,
                style: data.style,
                features: data.features,
                // Also add to tags for broader search
                tags: {
                    push: [data.color, data.style, ...data.features],
                },
            },
        });

        revalidatePath("/store/dashboard/products");
        revalidatePath(`/store/product/${productId}`);

        return { success: true, data };
    } catch (error: any) {
        console.error("AI Analysis Failed:", error);
        return { success: false, error: error.message };
    }
}
