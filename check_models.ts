import prisma from "./lib/db";

async function main() {
    const products = await prisma.product.findMany({
        select: {
            name: true,
            modelUrl: true,
        },
        where: {
            modelUrl: {
                not: null,
            },
        },
    });

    console.log("Products with model URLs:");
    products.forEach((p) => {
        console.log(`- ${p.name}: ${p.modelUrl}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
