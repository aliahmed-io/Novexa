import prisma from "@/lib/db";

export type ServiceStatus = "healthy" | "misconfigured" | "unhealthy";

interface HealthCheckResult {
    service: string;
    status: ServiceStatus;
    message?: string;
}

export async function checkIntegrations(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];

    // 1. Database (Prisma)
    try {
        await prisma.$queryRaw`SELECT 1`;
        results.push({ service: "Database", status: "healthy" });
    } catch (e) {
        results.push({ service: "Database", status: "unhealthy", message: "Connection failed" });
    }

    // 2. Stripe
    if (!process.env.STRIPE_SECRET_KEY) {
        results.push({ service: "Stripe", status: "misconfigured", message: "Missing API Key" });
    } else {
        results.push({ service: "Stripe", status: "healthy" });
    }

    // 3. Shippo
    if (!process.env.SHIPPO_API_KEY) {
        results.push({ service: "Shippo", status: "misconfigured", message: "Missing API Key" });
    } else {
        results.push({ service: "Shippo", status: "healthy" });
    }

    // 4. Resend
    if (!process.env.RESEND_API_KEY) {
        results.push({ service: "Resend", status: "misconfigured", message: "Missing API Key" });
    } else {
        results.push({ service: "Resend", status: "healthy" });
    }

    // 5. Gemini
    if (!process.env.GEMINI_API_KEY) {
        results.push({ service: "Gemini AI", status: "misconfigured", message: "Missing API Key" });
    } else {
        results.push({ service: "Gemini AI", status: "healthy" });
    }

    return results;
}
