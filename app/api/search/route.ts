import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { filterProducts } from "@/lib/filterProducts";
import type { Product } from "@/lib/assistantTypes";

const RANKING_SYSTEM_PROMPT = `You are a ranking engine for Novexa's shoe store search.
Your job is to analyze a list of products and the user's search query.

TASKS:
1. Identify which products are "Recommended" matches (high relevance).
2. Reorder the products so the best matches come first.

RULES:
- ONLY use the products provided in the JSON list.
- Do NOT invent new products or IDs.
- Focus on matching query terms to: name, description, color, gender, category, tags.
- CRITICAL: If a product's name or description contains a brand mentioned in the query (e.g. "Nike", "Adidas") OR a color mentioned in the query, it is a STRONG CANDIDATE for recommendation.
- Be generous with recommendations. If it's a good match, recommend it.
- Return a JSON object with two fields:
  - "rankedIds": Array of all product IDs in best-to-worst order.
  - "recommendedIds": Array of product IDs that are strong matches (can be empty, or contain 1, 2, 5, etc. items).

Example output:
{
  "rankedIds": ["id-123", "id-456", "id-789"],
  "recommendedIds": ["id-123", "id-456"]
}`;

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

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }

  const modelId = process.env.GEMINI_MODEL;
  if (!modelId) {
    throw new Error(
      "Missing GEMINI_MODEL environment variable. Set it to a valid Gemini model ID, e.g. 'gemini-2.5-flash'."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: RANKING_SYSTEM_PROMPT,
    generationConfig: { responseMimeType: "application/json" },
  });
}

function normalizeProducts(rows: any[]): Product[] {
  return rows.map((p: any) => ({
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

interface GeminiResponse {
  rankedIds: string[];
  recommendedIds: string[];
}

async function rerankWithGemini(query: string, products: Product[]): Promise<Product[]> {
  if (!query.trim() || products.length === 0) {
    return products;
  }

  try {
    const model = getGeminiModel();

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                `User search query: ${query}\n` +
                "Here is the current product list as JSON.\n" +
                JSON.stringify(products, null, 2),
            },
          ],
        },
      ],
    });

    const text = result.response.text().trim();

    let data: GeminiResponse | null = null;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!data || !Array.isArray(data.rankedIds)) {
      return products;
    }

    const byId = new Map<string, Product>();
    for (const p of products) {
      byId.set(p.id, p);
    }

    const recommendedSet = new Set(data.recommendedIds || []);
    const seen = new Set<string>();
    const ranked: Product[] = [];

    // Add ranked items
    for (const id of data.rankedIds) {
      if (typeof id !== "string") continue;
      const prod = byId.get(id);
      if (prod && !seen.has(id)) {
        // Attach the recommendation flag
        // We need to cast to any or extend the type if we want to add properties dynamically,
        // but since we are sending this to frontend, we can just add it.
        // However, TypeScript might complain if Product interface doesn't have it.
        // For now, let's assume we can extend it or the frontend will handle it.
        // Actually, let's update the Product type in the frontend or just add it here.
        // Since I can't easily change the shared type definition file right now without finding it,
        // I will just add it and cast as any if needed, but wait, `Product` is imported.
        // I'll check `lib/assistantTypes` later. For now, I'll add the property.
        (prod as any).isAiRecommended = recommendedSet.has(id);
        ranked.push(prod);
        seen.add(id);
      }
    }

    // Append remaining
    for (const p of products) {
      if (!seen.has(p.id)) {
        (p as any).isAiRecommended = false;
        ranked.push(p);
      }
    }

    return ranked;
  } catch (e) {
    console.error("Gemini rerank error:", e);
    return products;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body?.query ?? "").trim();
    const searchType = String(body?.searchType ?? "standard"); // 'standard' | 'ai'

    const rawProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
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

    // If query is empty, just return the latest products (no AI)
    if (!query) {
      return NextResponse.json({ results: products.slice(0, 20) });
    }

    // First, local filtering to keep things cheap and relevant
    const locallyFiltered = filterProducts(products, query);

    if (searchType === "ai") {
      // Only perform Gemini reranking
      const reranked = await rerankWithGemini(query, locallyFiltered);
      // Filter to return ONLY the AI recommended items
      const recommendedOnly = reranked.filter((p: any) => p.isAiRecommended);
      return NextResponse.json({ results: recommendedOnly });
    }

    // Standard search: return locally filtered results immediately
    return NextResponse.json({ results: locallyFiltered.slice(0, 20) });

  } catch (error: any) {
    const message =
      typeof error?.message === "string"
        ? error.message
        : "Something went wrong while performing search.";

    return NextResponse.json(
      {
        error: message,
        results: [] as Product[],
      },
      { status: 500 }
    );
  }
}
