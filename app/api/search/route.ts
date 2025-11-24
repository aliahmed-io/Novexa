import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { filterProducts } from "@/lib/filterProducts";
import type { Product } from "@/lib/assistantTypes";

const RANKING_SYSTEM_PROMPT = `You are a ranking engine for Novexa's shoe store search.
Your job is to reorder a list of products so that the best matches for the user's search query come first.

RULES:
- ONLY use the products provided in the JSON list.
- Do NOT invent new products or IDs.
- Focus on matching query terms to: name, description, color, gender, category, tags.
- Consider semantic meaning (e.g. "running" vs "jogging"), but stay within the given products.
- Return ONLY a JSON array of product IDs in best-to-worst order. No explanations, no extra text.

Example output:
["id-123", "id-456", "id-789"]`;

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
  });
}

function normalizeProducts(rows: any[]): Product[] {
  return rows.map((p: any) => ({
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
                "Here is the current product list as JSON. Return only a JSON array of product IDs, best match first.\n" +
                JSON.stringify(products, null, 2),
            },
          ],
        },
      ],
    });

    const text = result.response.text().trim();

    let ids: string[] | null = null;
    try {
      ids = JSON.parse(text);
      if (!Array.isArray(ids)) {
        ids = null;
      }
    } catch {
      ids = null;
    }

    if (!ids) {
      return products;
    }

    const byId = new Map<string, Product>();
    for (const p of products) {
      byId.set(p.id, p);
    }

    const seen = new Set<string>();
    const ranked: Product[] = [];

    for (const id of ids) {
      if (typeof id !== "string") continue;
      const prod = byId.get(id);
      if (prod && !seen.has(id)) {
        ranked.push(prod);
        seen.add(id);
      }
    }

    // Append any products that Gemini omitted, preserving their original order
    for (const p of products) {
      if (!seen.has(p.id)) {
        ranked.push(p);
      }
    }

    return ranked;
  } catch {
    // On any Gemini error, fall back to the original order
    return products;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body?.query ?? "").trim();

    const rawProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        category: true,
      },
    });

    const products = normalizeProducts(rawProducts);

    // If query is empty, just return the latest products (no AI)
    if (!query) {
      return NextResponse.json({ results: products.slice(0, 20) });
    }

    // First, local filtering to keep things cheap and relevant
    const locallyFiltered = filterProducts(products, query);

    // Then, let Gemini re-rank this smaller subset
    const reranked = await rerankWithGemini(query, locallyFiltered);

    return NextResponse.json({ results: reranked.slice(0, 20) });
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
