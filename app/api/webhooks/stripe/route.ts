import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (error: unknown) {
        return NextResponse.json({ error: "Webhook error" }, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const orderId = session.metadata?.orderId;

        if (orderId) {
            await prisma.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    status: "pending", // Or 'paid' if you have that status. Schema says 'pending', 'shipped', 'delivered', 'cancelled'.
                    // We should probably add a 'paid' status or assume 'pending' means paid but not shipped?
                    // The schema has PaymentStatus enum. Let's create the Payment record.
                },
            });

            await prisma.payment.create({
                data: {
                    amount: session.amount_total as number,
                    status: "COMPLETED",
                    orderId: orderId,
                    provider: "stripe",
                    transactionId: session.payment_intent as string,
                    currency: session.currency || "usd",
                },
            });
        }
    }

    return NextResponse.json(null, { status: 200 });
}
