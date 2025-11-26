import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { filterProducts } from "@/lib/filterProducts";
import type { AssistantMode, Product } from "@/lib/assistantTypes";

const SYSTEM_PROMPT = `You are Novexa’s Personal Shoe Expert, a friendly and professional footwear consultant.

GOAL:
Help users find the perfect shoes based on their needs. Be helpful, concise, and smart.

FORMATTING RULES:
- Use **Markdown** for everything.
- Use **Bold** for key terms and product names.
- Use Bullet points for lists.
- Keep paragraphs short (1-2 sentences).

CONCISENESS:
- Be brief. Do not waffle.
- Get straight to the point.
- Avoid generic intros like "I'd be happy to help with that."

PRODUCT LINKS (CRITICAL):
- When recommending a product, YOU MUST use this exact link format:
  [Product Name](/store/product/ID)
- Example: [Nike Air Max](/store/product/123-abc)
- Use the 'id' field from the provided JSON.

LOGIC & MATCHING:
- "Unisex" products are suitable for BOTH Men and Women. Recommend them freely.
- If a user asks for "Men's Black Shoes", a "Unisex Black Shoe" is a PERFECT match.
- Do not say "I couldn't find men's shoes" if unisex options exist.

MODES:
1. Basic Mode → Answer directly.
2. Advanced Mode → Ask 1 clarifying question if needed, otherwise recommend.

RECOMMENDATIONS:
- Recommend 1-3 best matches.
- Explain WHY it fits in 1 sentence.

TONE:
- Professional, cool, helpful. Not robotic.`;

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
