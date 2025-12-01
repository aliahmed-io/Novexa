import { stripe } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redis } from "@/lib/redis";
import { Cart } from "@/lib/interfaces";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { Stripe } from "stripe";

export async function POST() {
    try {
        const { getUser } = getKindeServerSession();
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let dbUser = await prisma.user.findUnique({
            where: {
                id: user.id,
            },
        });

        if (!dbUser) {
            dbUser = await prisma.user.create({
                data: {
                    id: user.id,
                    firstName: user.given_name ?? "",
                    lastName: user.family_name ?? "",
                    email: user.email ?? "",
                    profileImage: user.picture ?? `https://avatar.vercel.sh/${user.given_name}`,
                },
            });
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("STRIPE_SECRET_KEY is missing");
            return NextResponse.json({ error: "Stripe key missing" }, { status: 500 });
        }

        const cart: Cart | null = redis
            ? ((await redis.get<Cart>(`cart-${user.id}`)) as Cart | null)
            : null;

        if (!cart || !cart.items || cart.items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }

        console.log("Cart items:", JSON.stringify(cart.items));

        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.name,
                    images: [item.imageString],
                },
                unit_amount: item.price * 100, // Amount in cents
            },
            quantity: item.quantity,
        }));

        let couponId: string | undefined;

        if (cart.discountCode && cart.discountPercentage) {
            console.log("Creating coupon for discount:", cart.discountCode);
            try {
                // Create a coupon for this session
                const coupon = await stripe.coupons.create({
                    percent_off: cart.discountPercentage,
                    duration: "once",
                    name: cart.discountCode,
                });
                couponId = coupon.id;
            } catch (e) {
                console.error("Failed to create coupon:", e);
                // If coupon creation fails (e.g. duplicate name), try to find it or just proceed without it?
                // If it fails because it already exists, we should probably search for it.
                // But for now, let's just log it.
            }
        }

        const totalAmount = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
        const finalAmount = cart.discountPercentage
            ? totalAmount * (1 - cart.discountPercentage / 100)
            : totalAmount;

        console.log("Creating order in DB...");
        // Create a pending order in the database
        const order = await prisma.order.create({
            data: {
                amount: Math.round(finalAmount * 100),
                status: "pending",
                userId: user.id,
                discountId: cart.discountCode ? (await prisma.discount.findUnique({ where: { code: cart.discountCode } }))?.id : undefined,
            },
        });
        console.log("Order created:", order.id);

        console.log("Creating Stripe session...");
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: lineItems,
            discounts: couponId ? [{ coupon: couponId }] : undefined,
            success_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/store/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/store/checkout/cancel`,
            locale: "en",
            metadata: {
                orderId: order.id,
                userId: user.id,
            },
        });
        console.log("Stripe session created:", session.id);

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("Error in checkout API:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}
