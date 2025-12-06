
"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function subscribeToNewsletter(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;

    const emailSchema = z.string().email();
    const validation = emailSchema.safeParse(email);

    if (!validation.success) {
        return { success: false, error: "Invalid email address" };
    }

    // Check if user is logged in to link the subscription
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    try {
        await prisma.newsletterSubscriber.upsert({
            where: { email: email },
            update: {
                status: "subscribed",
                userId: user?.id // Link user if they logged in later or now
            },
            create: {
                email: email,
                userId: user?.id,
                status: "subscribed"
            }
        });

        return { success: true, message: "Subscribed successfully!" };
    } catch (error) {
        return { success: false, error: "Something went wrong. Please try again." };
    }
}

export async function unsubscribeFromNewsletter(email: string) {
    await prisma.newsletterSubscriber.update({
        where: { email: email },
        data: { status: "unsubscribed" }
    });
    return { success: true };
}
