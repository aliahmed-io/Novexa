"use server";

import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function exportProducts() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alihassan182006@gmail.com") {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const products = await prisma.product.findMany({
            include: {
                category: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Format data for CSV
        const formattedData = products.map((product) => ({
            name: product.name,
            description: product.description,
            status: product.status,
            price: product.price,
            images: product.images.join("|"),
            category: product.category.name,
            mainCategory: product.mainCategory,
            isFeatured: product.isFeatured,
            color: product.color,
            style: product.style,
            height: product.height,
            pattern: product.pattern,
            tags: product.tags.join(","),
            features: product.features.join(","),
            modelUrl: product.modelUrl,
            discountPercentage: product.discountPercentage,
        }));

        return { success: true, data: formattedData };
    } catch (error) {
        console.error("Export error:", error);
        return { success: false, message: "Failed to fetch products" };
    }
}
