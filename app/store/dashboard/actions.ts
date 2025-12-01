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

    let prompt = "";

    if (mode === 'text') {
        prompt = prepareImageGenContext(name, description, category);
    } else if (mode === 'sequence' && sourceImages.length > 0) {
        // Use Gemini Vision to analyze style
        // For now, we'll just mock the prompt generation or use a simple string if no API key
        // In real implementation: Call Gemini with sourceImages[0] and analyzeImageStylePrompt()
        prompt = `Create a product image for ${name} that matches the style of the provided reference: Studio lighting, minimalist background.`;
    } else if (mode === 'improve' && sourceImages.length > 0) {
        // Use Gemini Vision to enhance description
        prompt = `Create a high-quality, 4k professional product photo of ${name} based on the provided reference.`;
    } else {
        prompt = prepareImageGenContext(name, description, category);
    }

    console.log(`Generating image [${mode}] with prompt:`, prompt);

    // Mock Image Generation (Flux/Midjourney)
    // In a real app, you would fetch(FLUX_API_URL, { prompt })
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate delay

    // Return different placeholder images based on mode to show "variety"
    const placeholders = [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1964&auto=format&fit=crop"
    ];

    const randomImage = placeholders[Math.floor(Math.random() * placeholders.length)];

    return {
        success: true,
        imageUrl: randomImage,
    };
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
    const modelId = process.env.GEMINI_MODEL || "gemini-1.5-flash";

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
