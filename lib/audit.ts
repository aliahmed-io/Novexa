import prisma from "@/lib/db";

export async function logAudit({
    userId,
    action,
    targetType,
    targetId,
    metadata,
}: {
    userId?: string;
    action: string;
    targetType: string;
    targetId?: string;
    metadata?: any;
}) {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                targetType,
                targetId,
                metadata: metadata ? (metadata as any) : undefined,
            },
        });
    } catch (error) {
        console.error("Failed to write audit log:", error);
    }
}
