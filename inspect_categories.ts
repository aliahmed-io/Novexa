
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
    try {
        const categories = await prisma.category.findMany();
        console.log("Current Categories in DB:");
        console.log(JSON.stringify(categories, null, 2));
    } catch (error) {
        console.error("Error fetching categories:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
