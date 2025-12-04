"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getBusinessMetrics, prepareImageGenContext, analyzeImageStylePrompt, enhanceImageDescriptionPrompt } from "@/lib/ai/context";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateProductImage(
    name: string,
    description: string,
    category: string,
    mode: 'text' | 'sequence' | 'improve' = 'text',
    sourceImages: string[] = []
) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alihassan182006@gmail.com") {
        return { success: false, message: "Unauthorized" };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return { success: false, message: "API Key Missing" };
    }

    let prompt = "";
    if (mode === 'text') {
        prompt = `Professional product photography of ${name}, ${category}. ${description}. High quality, studio lighting, 4k, photorealistic.`;
    } else if (mode === 'sequence') {
        // Generate a different angle or context
        const angles = ["Side profile view", "Top down view", "Detailed close-up", "Lifestyle context"];
        const randomAngle = angles[Math.floor(Math.random() * angles.length)];
        prompt = `Professional product photography of ${name}, ${category}. ${description}. ${randomAngle}. Consistent style, studio lighting, 4k.`;
    } else if (mode === 'improve') {
        prompt = `High-end commercial product photography of ${name}, ${category}. ${description}. Award winning photography, 8k resolution, perfect lighting.`;
    }

    console.log(`Generating image [${mode}] with prompt:`, prompt);

    try {
        // Use Pollinations.ai (Free, Unlimited, Strong models like Flux)
        // We fetch the image and convert to Base64 to ensure it's static and doesn't rely on external hosting persistence
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Pollinations API Error: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString("base64");
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;

        return {
            success: true,
            imageUrl: imageUrl,
        };

    } catch (error) {
        console.error("Image Generation Failed:", error);
        return { success: false, message: "Failed to generate image" };
    }
}

export async function chatWithBusinessAdvisor(history: { role: string; parts: { text: string }[] }[], message: string) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alihassan182006@gmail.com") {
        return { success: false, message: "Unauthorized" };
    }

    const metrics = await getBusinessMetrics();

    const apiKey = process.env.GEMINI_API_KEY;
    // Fallback to a default model if not set, or handle error. 
    // Assuming GEMINI_MODEL is set or we use a default like 'gemini-pro'
    const modelId = process.env.GEMINI_MODEL || "gemini-2.5-pro";

    if (!apiKey) {
        return { success: false, message: "AI Configuration Missing" };
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelId });

        const systemPrompt = `You are an AI Business Advisor for an e-commerce store. 
        ROLE: You are a neutral planner and a tool. You are NOT a friendly assistant. Be objective, concise, and data-driven.
        
        CAPABILITIES:
        - Analyze business metrics provided below.
        - Create markdown tables to compare data or show plans.
        - "Browse the web" (Simulated): If asked about market trends or external info, simulate a search and provide relevant, realistic industry insights.
        - Memory: You have context of this conversation. Refer back to previous messages if needed.

        METRICS:
        ${JSON.stringify(metrics, null, 2)}

        INSTRUCTIONS:
        - Use Markdown for formatting (bold, tables, lists).
        - If the user asks for a plan, structure it clearly with steps.
        - If the user asks about market trends, say "Searching the web..." (simulated) and then provide the insight.
        `;

        // We need to map the history to the format Gemini expects if it's not already
        // The history passed from client might be simple objects.
        // Gemini expects { role: 'user' | 'model', parts: [{ text: string }] }

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to advise based on the provided metrics. I will remain neutral and objective." }],
                },
                ...history
            ],
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return { success: true, response };
    } catch (error) {
        console.error("AI Chat Error:", error);
        return { success: false, message: "Failed to generate response." };
    }
}
