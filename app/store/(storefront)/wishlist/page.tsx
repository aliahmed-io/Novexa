
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { ProductCard } from "@/components/storefront/ProductCard";
import { DashboardNavigation } from "@/components/Dashboard/DashboardNavigation";

async function getData(userId: string) {
    const data = await prisma.wishlistItem.findMany({
        where: {
            userId: userId,
        },
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    price: true,
                    images: true,
                    description: true, // Needed for ProductCard props
                }
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return data;
}

export default async function WishlistPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/api/auth/login");
    }

    const wishlistItems = await getData(user.id);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>

            {wishlistItems.length === 0 ? (
                <div className="text-center py-20">
                    <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500">Save items you love to view them here later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {wishlistItems.map((item) => (
                        <ProductCard key={item.id} item={item.product as any} />
                    ))}
                </div>
            )}
        </div>
    );
}
