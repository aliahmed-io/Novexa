import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Find "Unisex" category (case insensitive)
        const category = await prisma.category.findFirst({
            where: {
                name: {
                    equals: "Unisex",
                    mode: "insensitive",
                },
            },
        });

        if (category) {
            let uncategorized = await prisma.category.findUnique({
                where: { slug: "uncategorized" },
            });

            if (!uncategorized) {
                uncategorized = await prisma.category.create({
                    data: {
                        name: "Uncategorized",
                        slug: "uncategorized",
                        description: "Default category",
                    }
                });
            }

            await prisma.product.updateMany({
                where: { categoryId: category.id },
                data: { categoryId: uncategorized.id },
            });

            await prisma.category.delete({
                where: { id: category.id },
            });

            return NextResponse.json({ message: "Deleted Unisex category" });
        }

        return NextResponse.json({ message: "Unisex category not found" });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to delete category", details: error.message || error }, { status: 200 });
    }
}
