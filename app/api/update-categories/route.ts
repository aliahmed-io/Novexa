import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const categories = [
            { name: "Shoes", slug: "shoes" },
            { name: "Uncategorized", slug: "uncategorized" },
            { name: "Socks", slug: "socks" },
            { name: "Accessories", slug: "accessories" },
            { name: "Heels", slug: "heels" },
        ];

        const results = [];

        for (const cat of categories) {
            const existing = await prisma.category.findUnique({
                where: { slug: cat.slug },
            });

            if (!existing) {
                const created = await prisma.category.create({
                    data: {
                        name: cat.name,
                        slug: cat.slug,
                        description: `Category for ${cat.name}`,
                    },
                });
                results.push({ name: cat.name, status: "Created" });
            } else {
                results.push({ name: cat.name, status: "Exists" });
            }
        }

        return NextResponse.json({ results });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to update categories", details: error.message || error }, { status: 500 });
    }
}
