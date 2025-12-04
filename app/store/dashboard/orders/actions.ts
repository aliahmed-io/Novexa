"use server";

import prisma from "@/lib/db";
import { resend } from "@/lib/resend";
import { DeliveryEmail } from "@/components/emails/DeliveryEmail";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

export async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: { status: newStatus as OrderStatus },
            include: { User: true },
        });

        if (newStatus === "delivered" && order.User?.email) {
            await resend.emails.send({
                from: "Novexa <onboarding@resend.dev>",
                to: order.User.email,
                subject: "Your Order has been Delivered!",
                react: DeliveryEmail({ orderId: order.id }),
            });
        }

        revalidatePath("/store/dashboard/orders");
        return { success: true };
    } catch (error) {
        console.error("Failed to update order status:", error);
        return { error: "Failed to update status" };
    }
}
