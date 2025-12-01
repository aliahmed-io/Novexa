
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
    try {
        const categories = await prisma.category.findMany();
        console.log("Current Categories:", categories);

        for (const cat of categories) {
            const newName = cat.name.toLowerCase();
            const newSlug = cat.slug.toLowerCase();

            if (cat.name !== newName || cat.slug !== newSlug) {
                console.log(`Updating ${cat.name} to ${newName}...`);

                // Check if target exists to avoid unique constraint error during update
                const existing = await prisma.category.findUnique({
                    where: { name: newName }
                });

                if (existing && existing.id !== cat.id) {
                    console.log(`Skipping ${cat.name} -> ${newName} because target already exists. Deleting duplicate old one? No, manual intervention might be safer, but let's try to merge or just delete the old one if it has no products.`);
                    // For now, let's just try to update. If it fails, we know why.
                    // Actually, if "Men" exists and "men" exists, we should probably move products from "Men" to "men" and delete "Men".

                    // Let's check products count
                    const productsCount = await prisma.product.count({ where: { categoryId: cat.id } });
                    console.log(`Category ${cat.name} has ${productsCount} products.`);

                    if (productsCount === 0) {
                        console.log(`Deleting empty duplicate category ${cat.name}`);
                        await prisma.category.delete({ where: { id: cat.id } });
                    } else {
                        console.log(`Cannot automatically merge non-empty categories. Please check manually.`);
                    }

                } else {
                    await prisma.category.update({
                        where: { id: cat.id },
                        data: {
                            name: newName,
                            slug: newSlug,
                        },
                    });
                    console.log(`Updated ${cat.name} to ${newName}`);
                }
            }
        }
    } catch (error) {
        console.error("Error updating categories:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
