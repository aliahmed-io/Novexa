import prisma from "@/lib/db";

export async function getBusinessMetrics() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch recent daily stats (if we had a cron job populating them)
    // For now, we'll aggregate from Orders on the fly to simulate "DailyStat" if empty
    // In a real scenario, a cron job would populate DailyStat every midnight.

    const recentOrders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: sevenDaysAgo,
            },
        },
        select: {
            amount: true,
            createdAt: true,
        },
    });

    // Fetch top selling products (by revenue for simplicity, or count)
    const topProducts = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: sevenDaysAgo,
            },
        },
        include: {
            User: true,
        },
        take: 5,
        orderBy: {
            amount: "desc",
        },
    });

    const totalRevenue = recentOrders.reduce((acc, order) => acc + order.amount, 0);
    const totalOrders = recentOrders.length;
    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders / 100).toFixed(2) : "0.00";

    // Mock visitor count for now as we don't have analytics yet
    const totalVisitors = Math.floor(Math.random() * 500) + 100;

    return {
        period: "Last 7 Days",
        revenue: totalRevenue / 100,
        orders: totalOrders,
        visitors: totalVisitors,
        averageOrderValue: averageOrderValue,
        conversionRate: totalVisitors > 0 ? ((totalOrders / totalVisitors) * 100).toFixed(2) + "%" : "0%",
        recentTrend: "Stable", // Placeholder logic
        topRecentOrders: topProducts.map(p => ({
            amount: p.amount / 100,
            date: p.createdAt.toISOString().split('T')[0],
            customer: p.User ? `${p.User.firstName} ${p.User.lastName}` : "Guest"
        }))
    };
}

export function prepareImageGenContext(productName: string, description: string, category: string) {
    return `Create a professional, high-quality product image for a ${category} item named "${productName}". 
  Description: ${description}. 
  Style: Minimalist, studio lighting, 4k resolution, commercial photography.`;
}

export function analyzeImageStylePrompt(imageUrls: string[]) {
    return `Analyze the style of these product images. Describe the lighting, background, camera angle, and overall aesthetic. 
  Then, create a prompt to generate a NEW image of a similar product that perfectly matches this style. 
  Return ONLY the prompt string.`;
}

export function enhanceImageDescriptionPrompt() {
    return `Look at this low-quality product image. Describe the product in extreme detail, including materials, colors, and features. 
  Then, create a prompt to generate a HIGH-QUALITY, professional studio version of this exact product. 
  Return ONLY the prompt string.`;
}
