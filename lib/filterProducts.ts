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

    // 1. Exact tag matches
    for (const token of tokens) {
      if (tags.includes(token)) {
        score += 6;
      } else if (tags.some((t) => t.includes(token) || token.includes(t))) {
        score += 3;
      }
    }

    // 2. Keyword matches: color, gender, category
    for (const token of tokens) {
      if (color && (color === token || color.includes(token) || token.includes(color))) {
        score += 4;
      }
      if (gender && (gender === token || gender.includes(token) || token.includes(gender))) {
        score += 4;
      }
      if (category && (category === token || category.includes(token) || token.includes(category))) {
        score += 3;
      }
    }

    // 3. Fuzzy search on title + description (simple token includes)
    for (const token of tokens) {
      if (text.includes(token)) {
        score += 2;
      }
    }

    // 4. Small bonus if full query appears in text
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
