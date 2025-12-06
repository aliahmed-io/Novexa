import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import Stripe from "stripe";
import { resend } from "@/lib/resend";
import { OrderConfirmationEmail } from "@/components/emails/OrderConfirmationEmail";

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

    console.log("Stripe Webhook Received", JSON.stringify({
        id: event.id,
        type: event.type,
        created: new Date(event.created * 1000).toISOString(),
    }));

    if (event.type === "checkout.session.completed") {
        const orderId = session.metadata?.orderId;

        if (orderId) {
            await prisma.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    status: "pending",
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

            console.log("Order Payment Completed", JSON.stringify({
                orderId: orderId,
                amount: session.amount_total,
                transactionId: session.payment_intent,
            }));

            // Send Order Confirmation Email
            const customerEmail = session.customer_details?.email;
            if (customerEmail) {
                await resend.emails.send({
                    from: "Novexa <onboarding@resend.dev>",
                    to: customerEmail,
                    subject: "Order Confirmation",
                    react: OrderConfirmationEmail({
                        orderId: orderId,
                        amount: session.amount_total as number,
                    }),
                });
            }
        }
    }

    return NextResponse.json(null, { status: 200 });
}
