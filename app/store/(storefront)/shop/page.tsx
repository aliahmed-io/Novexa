import { CategoriesSelection } from "@/components/storefront/CategorySelection";
import { FeaturedProducts } from "@/components/storefront/FeaturedProducts";
import { Hero } from "@/components/storefront/Hero";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function IndexPage() {
  return (
    <div>
      <Hero />
      <CategoriesSelection />
      <FeaturedProducts />
      <div className="flex justify-center mt-10 mb-10">
        <Button asChild size="lg">
          <Link href="/store/products/all">
            Browse All Products
          </Link>
        </Button>
      </div>
    </div>
  );
}