
import prisma from "@/lib/db";

export type AuditAction =
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "LOGIN"
    | "EXPORT"
    | "PUBLISH"
    | "ARCHIVE"
    | "REFUND"
    | "SHIP_LABEL";

export type AuditTarget =
    | "PRODUCT"
    | "ORDER"
    | "USER"
    | "CATEGORY"
    | "BANNER"
    | "DISCOUNT"
    | "SHIPMENT"
    | "SYSTEM";

export async function logAudit(
    userId: string | undefined | null,
    action: AuditAction,
    targetType: AuditTarget,
    targetId?: string,
    metadata?: Record<string, any>
) {
    try {
        await prisma.auditLog.create({
            data: {
                userId: userId || undefined, // undefined will likely fail constraints if user not optional, checking schema
                action,
                targetType,
                targetId: targetId || "N/A",
                metadata: metadata ? JSON.stringify(metadata) : undefined,
            },
        });
    } catch (error) {
        console.error("Failed to write audit log:", error);
        // Don't throw, we don't want audit failure to break the main flow
    }
}
