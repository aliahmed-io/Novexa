import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const result = await prisma.product.updateMany({
            where: {
                modelUrl: {
                    contains: "example.com",
                },
            },
            data: {
                modelUrl: null,
            },
        });

        return NextResponse.json({ message: "Fixed bad models", count: result.count });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fix models", details: error.message }, { status: 500 });
    }
}
