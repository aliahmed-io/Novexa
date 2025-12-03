import Image from "next/image";
import Link from "next/link";
import all from "@/public/all.jpeg";
import men from "@/public/men.jpeg";
import women from "@/public/women.jpeg";

export function CategoriesSelection() {
  return (
    <div className="py-24 sm:py-32">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-extrabold tracking-tight">
          Shop by Category
        </h2>

        <Link
          className="text-sm font-semibold text-primary hover:text-primary/80"
          href="/store/products/all"
        >
          Browse all Products &rarr;
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:grid-rows-2 sm:gap-x-6 lg:gap-8">
        <div className="group relative h-[300px] sm:h-auto sm:aspect-square sm:row-span-2 rounded-xl overflow-hidden">
          <Image
            src={all}
            alt="All Products Image"
            className="object-cover object-center w-full h-full"
            fill
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-55" />
          <div className="absolute inset-0 p-6 flex items-end">
            <Link href="/store/products/all">
              <h3 className="text-white font-semibold">All Products</h3>
              <p className="mt-1 text-sm text-white">Shop Now</p>
            </Link>
          </div>
        </div>

        <div className="group relative h-[300px] sm:h-auto sm:aspect-[2/1] rounded-lg overflow-hidden">
          <Image
            src={men}
            alt="Products for men Image"
            className="object-cover object-center w-full h-full"
            fill
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-55" />
          <div className="absolute inset-0 p-6 flex items-end">
            <Link href="/store/products/men">
              <h3 className="text-white font-semibold">Products for Men</h3>
              <p className="mt-1 text-sm text-white">Shop Now</p>
            </Link>
          </div>
        </div>

        <div className="group relative h-[300px] sm:h-auto sm:aspect-[2/1] rounded-lg overflow-hidden">
          <Image
            src={women}
            alt="Women product image"
            className="object-cover object-center w-full h-full"
            fill
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-55" />
          <div className="absolute inset-0 p-6 flex items-end">
            <Link href="/store/products/women">
              <h3 className="text-white font-semibold">Products for Women</h3>
              <p className="mt-1 text-sm text-white">Shop Now</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
