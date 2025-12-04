import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const uncategorized = await prisma.category.findUnique({
            where: { slug: "uncategorized" },
        });

        if (uncategorized) {
            await prisma.category.update({
                where: { id: uncategorized.id },
                data: {
                    name: "General",
                    slug: "general",
                    description: "General category for products.",
                },
            });
            return NextResponse.json({ message: "Renamed Uncategorized to General" });
        }

        // Also check if "General" already exists to avoid errors if run multiple times
        const general = await prisma.category.findUnique({
            where: { slug: "general" },
        });

        if (general) {
            return NextResponse.json({ message: "General category already exists" });
        }

        return NextResponse.json({ message: "Uncategorized category not found" });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to rename category", details: error.message || error }, { status: 500 });
    }
}
