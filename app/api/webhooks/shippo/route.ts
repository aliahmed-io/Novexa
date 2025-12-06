
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { event, data } = body;

        console.log("Shippo webhook received:", event);

        if (event === "track_updated") {
            const trackingNumber = data.tracking_number;
            const status = data.tracking_status?.status; // UNKNOWN, PRE_TRANSIT, TRANSIT, DELIVERED, RETURNED, FAILURE

            if (trackingNumber && status) {
                console.log(`Updating shipment ${trackingNumber} to ${status}`);

                const shipment = await prisma.shipment.findFirst({
                    where: { trackingNumber },
                    include: { order: true },
                });

                if (shipment) {
                    let shipmentStatus: "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED" = "PENDING";
                    let orderStatus: "pending" | "shipped" | "delivered" | "cancelled" | undefined;

                    switch (status) {
                        case "PRE_TRANSIT":
                        case "TRANSIT":
                            shipmentStatus = "SHIPPED";
                            // Order is likely already 'shipped' when label bought, but we can confirm
                            orderStatus = "shipped";
                            break;
                        case "DELIVERED":
                            shipmentStatus = "DELIVERED";
                            orderStatus = "delivered";
                            break;
                        case "RETURNED":
                            shipmentStatus = "RETURNED";
                            // orderStatus = "cancelled"? Or just keep delivered? Maybe separate status.
                            // Schema has 'cancelled', but returned is different.
                            // For now, let's leave order status as is or update if logical.
                            break;
                        case "FAILURE":
                            // Handle failure?
                            break;
                    }

                    await prisma.shipment.update({
                        where: { id: shipment.id },
                        data: {
                            status: shipmentStatus,
                        },
                    });

                    if (orderStatus) {
                        await prisma.order.update({
                            where: { id: shipment.orderId },
                            data: { status: orderStatus },
                        });
                    }
                } else {
                    console.log("Shipment not found for tracking number:", trackingNumber);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Error processing Shippo webhook:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
