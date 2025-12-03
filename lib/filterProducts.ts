import type { Product } from "./assistantTypes";

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function filterProducts(products: Product[], query: string): Product[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) {
    return products.slice(0, 20);
  }

  const tokens = tokenize(normalizedQuery);

  const scored = products.map((product) => {
    let score = 0;

    const name = product.name.toLowerCase();
    const description = product.description.toLowerCase();
    const text = `${name} ${description}`;
    const color = product.color?.toLowerCase() ?? "";
    const gender = product.gender?.toLowerCase() ?? "";
    const category = product.category?.toLowerCase() ?? "";
    const tags = (product.tags ?? []).map((t) => t.toLowerCase());
    const style = product.style?.toLowerCase() ?? "";
    const height = product.height?.toLowerCase() ?? "";
    const pattern = product.pattern?.toLowerCase() ?? "";
    const features = (product.features ?? []).map((f) => f.toLowerCase());

    // Helper for strict word matching
    const hasWord = (text: string, word: string) => {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      return regex.test(text);
    };

    // 1. Exact tag/feature matches (Strict)
    for (const token of tokens) {
      if (tags.some(t => t === token || hasWord(t, token))) {
        score += 6;
      }
      if (features.some(f => f === token || hasWord(f, token))) {
        score += 5;
      }
    }

    // 2. Keyword matches: color, gender, category, style, height, pattern (Strict)
    for (const token of tokens) {
      if (color && (color === token || hasWord(color, token))) {
        score += 10; // Boosted score for color match
      }
      if (gender && (gender === token || hasWord(gender, token))) {
        score += 4;
      }
      if (category && (category === token || hasWord(category, token))) {
        score += 3;
      }
      if (style && (style === token || hasWord(style, token))) {
        score += 4;
      }
      if (height && (height === token || hasWord(height, token))) {
        score += 4;
      }
      if (pattern && (pattern === token || hasWord(pattern, token))) {
        score += 3;
      }
    }

    // 3. Fuzzy search on title + description (Strict word match preferred, fallback to includes)
    for (const token of tokens) {
      if (hasWord(text, token)) {
        score += 3;
      } else if (text.includes(token)) {
        score += 1; // Lower score for partial match
      }
    }

    // 4. Bonus if full query appears in text
    if (text.includes(normalizedQuery)) {
      score += 5;
    }

    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // If everything scored 0, just return first 20 products as a fallback.
  if (scored.length && scored[0].score === 0) {
    return products.slice(0, 20);
  }

  return scored
    .filter((item) => item.score > 0)
    .slice(0, 20)
    .map((item) => item.product);
}
