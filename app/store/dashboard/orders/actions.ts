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

    const addressTo = {
        name:
            order.shippingName ||
            `${order.User?.firstName ?? ""} ${order.User?.lastName ?? ""}`.trim() ||
            "Novexa Customer",
        street1: order.shippingStreet1 || "123 Main St",
        city: order.shippingCity || "New York",
        state: order.shippingState || "NY",
        zip: order.shippingPostalCode || "10001",
        country: order.shippingCountry || "US",
        email: order.User?.email ?? "support@novexa.com",
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
