import prisma from "@/lib/db";
import { Star } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

async function getReviews(productId: string) {
    const data = await prisma.review.findMany({
        where: {
            productId: productId,
        },
        select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            User: {
                select: {
                    firstName: true,
                    profileImage: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return data;
}

export async function ReviewList({ productId }: { productId: string }) {
    const reviews = await getReviews(productId);

    if (reviews.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10">
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 mt-6">
            {reviews.map((review) => (
                <div key={review.id} className="flex gap-4 border-b pb-6 last:border-b-0">
                    <Avatar>
                        <AvatarImage src={review.User.profileImage} alt={review.User.firstName} />
                        <AvatarFallback>{review.User.firstName.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold">{review.User.firstName}</p>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">
                            {new Intl.DateTimeFormat("en-US", {
                                dateStyle: "medium",
                            }).format(review.createdAt)}
                        </p>
                        <p className="mt-2 text-gray-700">{review.comment}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
