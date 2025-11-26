import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../lib/db";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelId = process.env.GEMINI_MODEL;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  if (!modelId) {
    throw new Error("GEMINI_MODEL is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelId });

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      images: true,
      color: true,
      style: true,
      height: true,
      pattern: true,
      tags: true,
      features: true,
    },
  });

  for (const product of products) {
    if (!product.images || product.images.length === 0) continue;

    const needsEnrichment =
      !product.style || !product.height || !product.pattern || !product.tags?.length;

    if (!needsEnrichment) continue;

    const imageUrl = product.images[0];

    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.warn(`Skipping ${product.id}, failed to fetch image`);
      continue;
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const prompt = `You are a shoe vision tagger. Look at this shoe image and respond with STRICT JSON only, no extra text:
{
  "color": "...",
  "style": "...",
  "height": "...",
  "pattern": "...",
  "tags": ["..."],
  "features": ["..."]
}

- "height": one of ["low-top", "mid-top", "high-top"]
- "pattern": like ["solid", "striped", "multicolor"]
- "style": e.g. "running", "basketball", "sneaker", "boot", "formal"
- "tags": short visual descriptors only (no full sentences).`;

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64,
              },
            },
          ],
        },
      ],
    });

    const text = result.response.text().trim();

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.warn(`Skipping ${product.id}, could not parse JSON`);
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        color: parsed.color ?? product.color ?? "",
        style: parsed.style ?? product.style ?? "",
        height: parsed.height ?? product.height ?? "",
        pattern: parsed.pattern ?? product.pattern ?? "",
        tags: parsed.tags ?? product.tags ?? [],
        features: parsed.features ?? product.features ?? [],
      },
    });

    console.log(`Enriched product ${product.id}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
