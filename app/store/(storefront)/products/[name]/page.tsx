import { ProductCard } from "@/components/storefront/ProductCard";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { FilterComponent } from "@/components/storefront/FilterComponent";

async function getData(
  productCategory: string,
  searchParams: { sort?: string; price?: string; color?: string }
) {
  const { sort, price, color } = searchParams;

  const where: any = {
    status: "published",
  };

  // Category Filter
  if (productCategory !== "all") {
    where.category = {
      slug: productCategory,
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

  return {
    title: title,
    data: data,
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
  searchParams: Promise<{ sort?: string; price?: string; color?: string }>;
}) {
  noStore();
  const { name } = await params;
  const searchParamsValue = await searchParams;
  const { data, title } = await getData(name, searchParamsValue);
  return (
    <section>
      <div className="flex items-center justify-between my-5">
        <h1 className="font-semibold text-3xl">{title}</h1>
      </div>

      <FilterComponent />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Apply the 'Product' type to the 'item' parameter */}
        {data.map((item: Product) => (
          <ProductCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}