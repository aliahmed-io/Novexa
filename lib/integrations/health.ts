
import prisma from "@/lib/db";
import { redis } from "@/lib/redis";
import { stripe } from "@/lib/stripe";

export type ServiceStatus = "operational" | "degraded" | "down" | "misconfigured";

export interface ServiceHealth {
    name: string;
    status: ServiceStatus;
    message?: string;
    latency?: number;
}

export async function checkDatabase(): Promise<ServiceHealth> {
    const start = performance.now();
    try {
        await prisma.$queryRaw`SELECT 1`;
        const end = performance.now();
        return {
            name: "Database (Neon)",
            status: "operational",
            latency: Math.round(end - start),
        };
    } catch (error) {
        return {
            name: "Database (Neon)",
            status: "down",
            message: error instanceof Error ? error.message : "Connection failed",
        };
    }
}

export async function checkRedis(): Promise<ServiceHealth> {
    const start = performance.now();
    if (!redis) {
        return { name: "Redis (Upstash)", status: "misconfigured", message: "Redis client not initialized" };
    }
    try {
        await redis.ping();
        const end = performance.now();
        return {
            name: "Redis (Upstash)",
            status: "operational",
            latency: Math.round(end - start),
        };
    } catch (error) {
        return {
            name: "Redis (Upstash)",
            status: "down",
            message: "Ping failed",
        };
    }
}

export async function checkStripe(): Promise<ServiceHealth> {
    const start = performance.now();
    if (!process.env.STRIPE_SECRET_KEY) {
        return { name: "Stripe", status: "misconfigured", message: "Missing STRIPE_SECRET_KEY" };
    }
    try {
        // Lightweight call to check auth
        await stripe.paymentMethods.list({ limit: 1 });
        const end = performance.now();
        return {
            name: "Stripe",
            status: "operational",
            latency: Math.round(end - start),
        };
    } catch (error) {
        return {
            name: "Stripe",
            status: "down",
            message: error instanceof Error ? error.message : "API check failed",
        };
    }
}

export async function checkResend(): Promise<ServiceHealth> {
    // Resend check is mostly env var based unless we want to try sending a dummy email (too intrusive)
    if (!process.env.RESEND_API_KEY) {
        return { name: "Resend", status: "misconfigured", message: "Missing RESEND_API_KEY" };
    }
    // We assume operational if key exists for now, avoiding API quota usage for simple health checks
    return { name: "Resend", status: "operational", message: "Configured" };
}

export async function checkShippo(): Promise<ServiceHealth> {
    if (!process.env.SHIPPO_API_KEY) {
        return { name: "Shippo", status: "misconfigured", message: "Missing SHIPPO_API_KEY" };
    }
    // Similar to Resend, basic config check
    return { name: "Shippo", status: "operational", message: "Configured" };
}

export async function checkGemini(): Promise<ServiceHealth> {
    if (!process.env.GEMINI_API_KEY) {
        return { name: "Gemini AI", status: "misconfigured", message: "Missing GEMINI_API_KEY" };
    }
    return { name: "Gemini AI", status: "operational", message: "Configured" };
}

export async function getAllHealth(): Promise<ServiceHealth[]> {
    const results = await Promise.all([
        checkDatabase(),
        checkRedis(),
        checkStripe(),
        checkResend(),
        checkShippo(),
        checkGemini()
    ]);
    return results;
}
