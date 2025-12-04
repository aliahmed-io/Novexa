import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: {
                modelUrl: {
                    contains: "example.com",
                },
            },
            select: {
                id: true,
                name: true,
                modelUrl: true,
            },
        });

        return NextResponse.json({ count: products.length, products });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to check products", details: error.message }, { status: 500 });
    }
}
