"use server";

import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";

export async function importProducts(data: any[]) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alihassan182006@gmail.com") {
        console.error("Import Unauthorized. User:", user?.email);
        return { success: false, message: "Unauthorized" };
    }

    try {
        let count = 0;

        for (const row of data) {
            if (!row.name || !row.price) continue;

            // Handle Category
            let categoryId = "";
            if (row.category) {
                const categorySlug = row.category.toLowerCase().replace(/ /g, "-");

                // Check by slug first (safer for unique constraint)
                let existingCategory = await prisma.category.findUnique({
                    where: { slug: categorySlug },
                });

                // If not found by slug, check by name just in case
                if (!existingCategory) {
                    existingCategory = await prisma.category.findUnique({
                        where: { name: row.category },
                    });
                }

                if (existingCategory) {
                    categoryId = existingCategory.id;
                } else {
                    const newCategory = await prisma.category.create({
                        data: {
                            name: row.category,
                            slug: categorySlug,
                            description: `Created via bulk import`,
                        },
                    });
                    categoryId = newCategory.id;
                }
            } else {
                // Default category or skip? Let's skip for now if no category
                continue;
            }

            // Parse Arrays
            const images = row.images ? row.images.split("|").map((s: string) => s.trim()) : [];
            const tags = row.tags ? row.tags.split(",").map((s: string) => s.trim()) : [];
            const features = row.features ? row.features.split(",").map((s: string) => s.trim()) : [];

            await prisma.product.create({
                data: {
                    name: row.name,
                    description: row.description || "",
                    status: row.status || "draft",
                    price: Number(row.price),
                    images: images,
                    categoryId: categoryId,
                    isFeatured: row.isFeatured === "true" || row.isFeatured === true,
                    color: row.color || "",
                    style: row.style || "",
                    height: row.height || "",
                    pattern: row.pattern || "",
                    tags: tags,
                    features: features,
                    modelUrl: row.modelUrl || null,
                    discountPercentage: Number(row.discountPercentage) || 0,
                },
            });
            count++;
        }

        revalidatePath("/store/dashboard/products");
        return { success: true, count };
    } catch (error) {
        console.error("Import error details:", error);
        return { success: false, message: "Failed to import products: " + (error as Error).message };
    }
}
