"use server";

import prisma from "@/lib/db";
import { getShippingRates, purchaseLabel } from "@/lib/shippo";
import { revalidatePath } from "next/cache";

export async function fetchShippingRates(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            User: true,
            shipment: true,
        },
    });

    if (!order) throw new Error("Order not found");
    if (!order.User) throw new Error("User address missing");

    // Mock address parsing (In a real app, you'd store structured address)
    // Assuming User has address fields or we parse from a single string
    // For now, using hardcoded "To" address based on user name for demo
    const addressTo = {
        name: `${order.User.firstName} ${order.User.lastName}`,
        street1: "123 Main St", // Placeholder - needs real address field in User model
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "US",
        email: order.User.email,
    };

    const rates = await getShippingRates(addressTo);
    return rates;
}

export async function buyShippingLabel(orderId: string, rateId: string) {
    const transaction = await purchaseLabel(rateId);

    if (transaction.status !== "SUCCESS") {
        throw new Error("Failed to purchase label: " + transaction.messages?.[0]?.text);
    }

    await prisma.shipment.upsert({
        where: { orderId },
        create: {
            orderId,
            trackingNumber: transaction.tracking_number as string,
            carrier: transaction.rate.provider as string,
            status: "SHIPPED",
            labelUrl: transaction.label_url as string,
            eta: transaction.eta ? new Date(transaction.eta) : null,
            shippoId: transaction.object_id as string,
        },
        update: {
            trackingNumber: transaction.tracking_number as string,
            carrier: transaction.rate.provider as string,
            status: "SHIPPED",
            labelUrl: transaction.label_url as string,
            eta: transaction.eta ? new Date(transaction.eta) : null,
            shippoId: transaction.object_id as string,
        },
    });

    await prisma.order.update({
        where: { id: orderId },
        data: { status: "shipped" },
    });

    revalidatePath(`/store/dashboard/orders/${orderId}`);
    return transaction;
}

export async function updateOrderStatus(orderId: string, status: string) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status: status as any },
        });
        revalidatePath("/store/dashboard/orders");
        return { success: true };
    } catch (error) {
        return { error: "Failed to update status" };
    }
}
