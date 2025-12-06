import { addItem } from "@/app/store/actions";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/storefront/WishlistButton";
import { ShoppingBag, Star } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { ThreeDViewer } from "@/components/product/ThreeDViewer";
import { unstable_noStore as noStore } from "next/cache";
import { ReviewForm } from "@/components/storefront/ReviewForm";
import { ReviewList } from "@/components/storefront/ReviewList";
import { StarRating } from "@/components/storefront/StarRating";

async function getData(productId: string) {
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
            discountPercentage: true,
            averageRating: true,
            reviewCount: true,
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
    noStore();
    const { id } = await params;
    const data = await getData(id);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start lg:gap-x-24 py-6">
            <div className="relative h-[500px] w-full">
                {/* 3D Viewer or Image Carousel */}
                <ThreeDViewer modelUrl={data.modelUrl} images={data.images} />
            </div>

            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                    {data.name}
                </h1>
                <div className="flex items-baseline gap-4 mt-2">
                    <p className="text-3xl text-gray-900">
                        ${data.discountPercentage > 0 ? Math.round(data.price * (1 - data.discountPercentage / 100)) : data.price}
                    </p>
                    {data.discountPercentage > 0 && (
                        <p className="text-xl text-gray-500 line-through">${data.price}</p>
                    )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                    <StarRating rating={data.averageRating} />
                    <p className="text-sm text-gray-500">({data.reviewCount} reviews)</p>
                </div>
                <p className="text-base text-gray-700 mt-6">{data.description}</p>

                <form action={addItem.bind(null, data.id)}>
                    <div className="flex gap-4 mt-10">
                        <Button size="lg" className="w-full font-bold">
                            <ShoppingBag className="mr-4 h-5 w-5" /> Add to Bag
                        </Button>
                        <div className="flex-shrink-0">
                            <WishlistButton productId={data.id} />
                        </div>
                    </div>
                </form>
            </div>

            <div className="col-span-1 md:col-span-2 mt-16">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Customer Reviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                        <ReviewForm productId={data.id} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
                        <ReviewList productId={data.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
