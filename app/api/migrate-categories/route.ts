import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // 1. Check if "Uncategorized" exists
        let defaultCategory = await prisma.category.findUnique({
            where: {
                slug: "uncategorized",
            },
        });

        if (!defaultCategory) {
            defaultCategory = await prisma.category.create({
                data: {
                    name: "Uncategorized",
                    slug: "uncategorized",
                    description: "Default category for products without a specific category.",
                },
            });
            console.log("Created 'Uncategorized' category.");
        }

        // 2. Move ALL existing products to "Uncategorized" as requested
        const products = await prisma.product.updateMany({
            data: {
                categoryId: defaultCategory.id,
            },
        });

        return NextResponse.json({
            message: "Migration complete",
            createdDefault: !!defaultCategory,
            updatedProducts: products.count,
        });
    } catch (error) {
        console.error("Migration failed:", error);
        return NextResponse.json({ error: "Migration failed" }, { status: 500 });
    }
}
