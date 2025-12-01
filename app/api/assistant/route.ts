import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { filterProducts } from "@/lib/filterProducts";
import type { AssistantMode, Product } from "@/lib/assistantTypes";

const SYSTEM_PROMPT = `You are Novexa’s Personal Shoe Expert.

GOAL:
Help users find the perfect shoes.

OUTPUT FORMAT:
You must return a JSON object with this structure:
{
  "message": "Your response text here (use Markdown for bolding key terms)",
  "recommendedProductIds": ["id1", "id2"]
}

RULES:
- "message": Be helpful, concise (1-2 sentences), and professional.
- "recommendedProductIds": An array of product IDs from the provided list that match the user's request.
- If no products match, return an empty array for IDs and explain in the message.
- "Unisex" products match both Men and Women.
- Do NOT include links in the "message" text. The UI will render cards based on the IDs.
`;

const COLOR_WORDS = [
  "black",
  "white",
  "pink",
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "brown",
  "grey",
  "gray",
  "orange",
  "beige",
  "cream",
  "navy",
];

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
    color: (() => {
      const dbColor = (p.color as string | undefined)?.toLowerCase() ?? "";
      if (dbColor) return dbColor;
      const text = `${p.name ?? ""} ${p.description ?? ""}`.toLowerCase();
      for (const c of COLOR_WORDS) {
        if (text.includes(c)) return c;
      }
      return "";
    })(),
    category: String(p.category ?? ""),
    description: p.description ?? "",
    features: (p.features as string[]) ?? [],
    url: (p.url as string) ?? "",
    tags: (p.tags as string[]) ?? [],
    images: (p.images as string[]) ?? [],
    style: (p.style as string) ?? "",
    height: (p.height as string) ?? "",
    pattern: (p.pattern as string) ?? "",
  }));
}

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    message: { type: SchemaType.STRING },
    recommendedProductIds: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: ["message", "recommendedProductIds"],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = String(body?.message ?? "").trim();
    const mode: AssistantMode = body?.mode === "advanced" ? "advanced" : "basic";

    if (!message) {
      return NextResponse.json(
        { role: "assistant", content: "Please provide a question." },
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
        images: true,
        color: true,
        style: true,
        height: true,
        pattern: true,
        tags: true,
        features: true,
      },
    });

    const products = normalizeProducts(rawProducts);
    const filtered = filterProducts(products, message);
    const limited = filtered.slice(0, 20);

    const genAI = getGeminiClient();
    const modelId = process.env.GEMINI_MODEL;
    if (!modelId) {
      throw new Error("Missing GEMINI_MODEL environment variable.");
    }

    const model = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
      },
    });

    const modeInstruction =
      mode === "advanced"
        ? "Mode: Advanced. Ask clarifying questions if needed."
        : "Mode: Basic. Recommend directly.";

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: modeInstruction },
            {
              text:
                "Available Products JSON:\n" +
                JSON.stringify(limited.map(p => ({ id: p.id, name: p.name, description: p.description, gender: p.gender, price: p.price })), null, 2),
            },
            { text: "\n\nUser message:\n" + message },
          ],
        },
      ],
    });

    const responseText = result.response.text();
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", responseText);
      // Fallback
      return NextResponse.json({
        role: "assistant",
        content: responseText,
        products: [],
      });
    }

    // Map IDs back to full product objects
    const recommendedProducts = (parsedResponse.recommendedProductIds || [])
      .map((id: string) => products.find((p) => p.id === id))
      .filter(Boolean);

    return NextResponse.json({
      role: "assistant",
      content: parsedResponse.message,
      products: recommendedProducts,
    });
  } catch (error: any) {
    console.error("Assistant Error:", error);
    return NextResponse.json(
      {
        role: "assistant",
        content: "I’m having trouble reaching the Novexa assistant right now.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
