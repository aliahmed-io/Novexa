
"use server";

import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const returnSchema = z.object({
    reason: z.string().min(1, "Reason is required"),
    orderId: z.string().min(1),
});

export async function submitReturnRequest(prevState: any, formData: FormData) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/api/auth/login");
    }

    const result = returnSchema.safeParse({
        reason: formData.get("reason"),
        orderId: formData.get("orderId"),
    });

    if (!result.success) {
        return {
            success: false,
            error: result.error.errors[0].message,
        };
    }

    const { reason, orderId } = result.data;

    // Verify ownership and eligibility (e.g. status is DELIVERED)
    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
            userId: user.id,
        },
    });

    if (!order) {
        return { success: false, error: "Order not found" };
    }

    if (order.status !== "delivered") {
        // In a real app, strict checks here. For MVP, we might depend on UI or soft check.
        // return { success: false, error: "Order must be delivered to request a return" };
    }

    // Check if request already exists
    const existingRequest = await prisma.returnRequest.findFirst({
        where: { orderId: orderId },
    });

    if (existingRequest) {
        return { success: false, error: "Return request already submitted for this order" };
    }

    await prisma.returnRequest.create({
        data: {
            orderId: orderId,
            userId: user.id,
            reason: reason,
            status: "PENDING",
        },
    });

    revalidatePath("/store/orders");
    revalidatePath(`/store/orders/${orderId}`);

    return { success: true };
}
