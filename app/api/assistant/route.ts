import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { filterProducts } from "@/lib/filterProducts";
import type { AssistantMode, Product } from "@/lib/assistantTypes";

const SYSTEM_PROMPT = `You are Novexa’s Personal Shoe Expert, a friendly and professional footwear consultant. 
You help users find the perfect shoes based on their budget, foot issues, preferences, style, gender, and color. 
You are NOT customer support. You are a knowledgeable shoe expert.

MODES:
1. Basic Mode → Do NOT ask clarifying questions. Respond directly.
2. Advanced Mode → Ask 1–3 clarifying questions before recommending.

RECOMMENDATIONS:
- Recommend up to 3 products.
- Order: Best → Great Alternative → Third Good Option.
- ALWAYS explain why each product fits the user’s needs.
- Include product links ONLY when the user is clearly shopping.

GENERAL QUESTIONS:
If the user asks something general (“best shoe brand?”, “what’s more comfortable?”), provide a normal answer with NO product list.

CONTEXT:
You will receive a filtered product list from the database as JSON. 
ONLY recommend from these products. 
If no product fits, say so politely and offer the closest matches.

TONE:
Friendly, warm, professional, knowledgeable.
Never robotic, never pushy, never sales-y.`;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }
  return new GoogleGenerativeAI(apiKey);
}

function normalizeProducts(rows: any[]): Product[] {
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    gender: (p.gender as string) ?? "unisex",
    color: (p.color as string) ?? "",
    category: String(p.category ?? ""),
    description: p.description ?? "",
    features: (p.features as string[]) ?? [],
    url: (p.url as string) ?? "",
    tags: (p.tags as string[]) ?? [],
  }));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = String(body?.message ?? "").trim();
    const mode: AssistantMode = body?.mode === "advanced" ? "advanced" : "basic";

    if (!message) {
      return NextResponse.json(
        { role: "assistant", content: "Please provide a question or describe what kind of shoes you are looking for." },
        { status: 400 }
      );
    }

    const rawProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        category: true,
        // The following fields do not currently exist on the Prisma model,
        // but are normalized in normalizeProducts with sensible defaults
        // so this select stays minimal and always live.
      },
    });

    const products = normalizeProducts(rawProducts);
    const filtered = filterProducts(products, message);
    const limited = filtered.slice(0, 20);

    const genAI = getGeminiClient();

    const modelId = process.env.GEMINI_MODEL;
    if (!modelId) {
      throw new Error(
        "Missing GEMINI_MODEL environment variable. Set it to a valid Gemini model ID, e.g. 'gemini-2.5-flash'."
      );
    }

    const model = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction: SYSTEM_PROMPT,
    });

    const modeInstruction =
      mode === "advanced"
        ? "Mode: Advanced. Ask 1–3 clarifying questions before recommending products, when appropriate."
        : "Mode: Basic. Do NOT ask clarifying questions. Respond directly with recommendations if the user is shopping.";

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: modeInstruction },
            {
              text:
                "Here is the current filtered product list from the database as JSON. Only recommend from these products. If none are suitable, say so and offer closest matches.\n" +
                JSON.stringify(limited, null, 2),
            },
            { text: "\n\nUser message:\n" + message },
          ],
        },
      ],
    });

    const responseText = result.response.text();

    return NextResponse.json({ role: "assistant", content: responseText });
  } catch (error: any) {
    const message =
      typeof error?.message === "string"
        ? error.message
        : "Something went wrong while generating a response.";

    return NextResponse.json(
      {
        role: "assistant",
        content:
          "I’m having trouble reaching the Novexa assistant right now. Please try again in a moment.",
        error: message,
      },
      { status: 500 }
    );
  }
}
