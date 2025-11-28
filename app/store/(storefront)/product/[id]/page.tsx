import { addItem } from "@/app/store/actions";
import { ShoppingBagButton } from "@/components/SubmitButtons";
import { FeaturedProducts } from "@/components/storefront/FeaturedProducts";
import { AntigravityViewer } from "@/components/storefront/AntigravityViewer";
import prisma from "@/lib/db";
import { StarIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

async function getData(productId: string) {
  noStore();
  const data = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      images: true,
      modelUrl: true,
    },
  });

  if (!data) {
    return notFound();
  }

  return data;
}

export default async function ProductIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getData(id);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start lg:gap-x-24 py-6">
        <AntigravityViewer
          posterImage={data.images[0]}
          modelUrl={data.modelUrl}
        />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            {data.name}
          </h1>
          <p className="text-3xl mt-2 text-gray-900">${data.price}</p>
          <div className="mt-3 flex items-center gap-1">
            <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </div>
          <p className="text-base text-gray-700 mt-6">{data.description}</p>

          <form action={addItem.bind(null, data.id)}>
            <ShoppingBagButton />
          </form>
        </div>
      </div>

      <div className="mt-16">
        <FeaturedProducts />
      </div>
    </>
  );
}