"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { z } from "zod";

const csvProductSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    status: z.enum(["draft", "published", "archived"]),
    price: z.number().min(0),
    images: z.string(), // Comma separated URLs
    category: z.string().min(1),
    isFeatured: z.boolean().optional(),
});

export async function importProducts(data: any[]) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alihassan182006@gmail.com") {
        return { success: false, message: "Unauthorized" };
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const [index, row] of data.entries()) {
        try {
            // Pre-process row to match schema types (CSV parsing might give strings for everything)
            const formattedRow = {
                ...row,
                price: Number(row.price),
                isFeatured: row.isFeatured === "true" || row.isFeatured === true,
            };

            const result = csvProductSchema.safeParse(formattedRow);

            if (!result.success) {
                errorCount++;
                errors.push(`Row ${index + 1}: ${result.error.issues.map(i => i.message).join(", ")}`);
                continue;
            }

            const { category, images, ...productData } = result.data;

            // Smart Image Extraction
            // If the image URL looks like a webpage (no extension), try to fetch it and find og:image
            const rawImages = images.split(",").map(url => url.trim()).filter(url => url.length > 0);
            const processedImages = [];

            for (const url of rawImages) {
                if (!url.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
                    try {
                        // It's likely a webpage, try to scrape og:image
                        const res = await fetch(url, {
                            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NovexaBot/1.0)' }
                        });
                        if (res.ok) {
                            const html = await res.text();
                            // Simple regex to find og:image
                            const match = html.match(/<meta property="og:image" content="([^"]+)"/i) ||
                                html.match(/<meta name="og:image" content="([^"]+)"/i);

                            if (match && match[1]) {
                                processedImages.push(match[1]);
                                continue;
                            }
                        }
                    } catch (e) {
                        // Ignore fetch errors, keep original URL
                    }
                }
                processedImages.push(url);
            }

            // Find or create category
            // We use upsert to ensure it exists. 
            // Note: Category requires a slug. We'll generate one from the name.
            const slug = category.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

            const categoryRecord = await prisma.category.upsert({
                where: { name: category },
                update: {},
                create: {
                    name: category,
                    slug: slug,
                    description: `Created via bulk import`,
                },
            });

            await prisma.product.create({
                data: {
                    ...productData,
                    images: processedImages,
                    categoryId: categoryRecord.id,
                },
            });

            successCount++;
        } catch (error: any) {
            errorCount++;
            errors.push(`Row ${index + 1}: ${error.message}`);
        }
    }

    return {
        success: true,
        count: successCount,
        errors: errors,
    };
}

export async function exportProducts() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alihassan182006@gmail.com") {
        return redirect("/store/shop");
    }

    const products = await prisma.product.findMany({
        include: {
            category: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Format for CSV
    const csvData = products.map((product) => ({
        name: product.name,
        description: product.description,
        status: product.status,
        price: product.price,
        images: product.images.join(", "),
        category: product.category.name,
        isFeatured: product.isFeatured,
    }));

    return csvData;
}
