import { ProductCard } from "@/components/storefront/ProductCard";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { FilterComponent } from "@/components/storefront/FilterComponent";

async function getData(
  productCategory: string,
  searchParams: { sort?: string; price?: string; color?: string; category?: string }
) {
  const { sort, price, color, category } = searchParams;

  const where: any = {
    status: "published",
  };

  // Category Filter (Main Category from URL path)
  if (productCategory !== "all") {
    const mainCategories = ["men", "women", "kids"];
    if (mainCategories.includes(productCategory.toLowerCase())) {
      where.mainCategory = productCategory.toUpperCase();
    } else {
      where.category = {
        slug: productCategory,
      };
    }
  }

  // Sub-Category Filter (from Dropdown)
  if (category && category !== "all") {
    where.category = {
      slug: category,
    };
  }

  // Price Filter
  if (price) {
    if (price === "under-50") {
      where.price = { lt: 50 };
    } else if (price === "50-100") {
      where.price = { gte: 50, lte: 100 };
    } else if (price === "100-200") {
      where.price = { gte: 100, lte: 200 };
    } else if (price === "over-200") {
      where.price = { gt: 200 };
    }
  }

  // Color Filter
  if (color && color !== "all") {
    where.color = {
      contains: color,
      mode: "insensitive",
    };
  }

  // Sorting
  let orderBy: any = {
    createdAt: "desc",
  };

  if (sort) {
    if (sort === "price-asc") {
      orderBy = { price: "asc" };
    } else if (sort === "price-desc") {
      orderBy = { price: "desc" };
    } else if (sort === "popularity") {
      orderBy = { reviewCount: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }
  }

  const data = await prisma.product.findMany({
    where: where,
    orderBy: orderBy,
    select: {
      name: true,
      images: true,
      price: true,
      id: true,
      description: true,
      discountPercentage: true,
    },
  });

  let title = "All Products";
  if (productCategory === "men") title = "Products for Men";
  else if (productCategory === "women") title = "Products for Women";
  else if (productCategory === "kids") title = "Products for Kids";

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return {
    title: title,
    data: data,
    categories: categories,
  };
}

// Define a type for the product data structure
interface Product {
  id: string;
  name: string;
  images: string[];
  price: number;
  description: string;
  discountPercentage: number;
}

export default async function CategoriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ sort?: string; price?: string; color?: string; category?: string }>;
}) {
  noStore();
  const { name } = await params;
  const searchParamsValue = await searchParams;
  const { data, title, categories } = await getData(name, searchParamsValue);
  return (
    <section>
      <div className="flex items-center justify-between my-5">
        <h1 className="font-semibold text-3xl">{title}</h1>
      </div>

      <FilterComponent categories={categories} />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Apply the 'Product' type to the 'item' parameter */}
        {data.map((item: Product) => (
          <ProductCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}