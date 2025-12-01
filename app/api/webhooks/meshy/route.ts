import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { checkModelQuality } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, status, model_urls, thumbnail_url, progress } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
        }

        // Find product by meshyTaskId
        const product = await prisma.product.findFirst({
            where: {
                meshyTaskId: id,
            },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        if (status === "SUCCEEDED") {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    meshyStatus: "SUCCEEDED",
                    meshyProgress: 100,
                    modelUrl: model_urls?.glb, // Save the GLB model URL
                },
            });

            // Trigger Gemini QA
            if (thumbnail_url) {
                const qaResult = await checkModelQuality(thumbnail_url);
                console.log("Gemini QA Result:", qaResult);
                // In a real app, we might store this in the DB
            }

        } else if (status === "FAILED") {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    meshyStatus: "FAILED",
                    meshyProgress: progress || 0,
                },
            });
        } else if (status === "IN_PROGRESS") {
            await prisma.product.update({
                where: { id: product.id },
                data: {
                    meshyStatus: "IN_PROGRESS",
                    meshyProgress: progress || 0,
                },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Meshy Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
