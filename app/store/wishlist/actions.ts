"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(productId: string) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return { success: false, error: "Must be logged in" };
    }

    const existingItem = await prisma.wishlistItem.findUnique({
        where: {
            userId_productId: {
                userId: user.id,
                productId: productId,
            },
        },
    });

    if (existingItem) {
        await prisma.wishlistItem.delete({
            where: {
                id: existingItem.id,
            },
        });
        revalidatePath("/store/wishlist");
        revalidatePath(`/store/product/${productId}`);
        return { success: true, isWishlisted: false };
    } else {
        await prisma.wishlistItem.create({
            data: {
                userId: user.id,
                productId: productId,
            },
        });
        revalidatePath("/store/wishlist");
        revalidatePath(`/store/product/${productId}`);
        return { success: true, isWishlisted: true };
    }
}

export async function getWishlistStatus(productId: string) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) return false;

    const item = await prisma.wishlistItem.findUnique({
        where: {
            userId_productId: {
                userId: user.id,
                productId: productId,
            },
        },
    });

    return !!item;
}
