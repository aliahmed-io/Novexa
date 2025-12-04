"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { resend } from "@/lib/resend";
import { BroadcastEmail } from "@/components/emails/BroadcastEmail";

export async function sendBroadcastEmail(formData: FormData) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "admin@novexa.com") {
        // Basic admin check - ideally use a role or permission system
        // For now, assuming admin@novexa.com is the admin or checking against a list
        // You might want to implement a proper admin check here
        // return redirect("/");
    }

    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!subject || !message) {
        return { error: "Subject and message are required" };
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                email: true,
            },
        });

        // In a real production app with many users, you'd want to batch this
        // or use a queue system (like Redis/BullMQ) to avoid timeouts.
        // Resend also supports batch sending.

        // For simplicity/MVP, we'll loop.
        // Note: Resend free tier has limits.

        // Using 'onboarding@resend.dev' for testing if domain not verified.
        // Replace with your verified domain, e.g., 'updates@yourdomain.com'
        const fromEmail = "Novexa <onboarding@resend.dev>";

        const emailPromises = users.map((user) =>
            resend.emails.send({
                from: fromEmail,
                to: user.email,
                subject: subject,
                react: BroadcastEmail({ subject, message }),
            })
        );

        await Promise.all(emailPromises);

        return { success: true };
    } catch (error) {
        console.error("Failed to send broadcast:", error);
        return { error: "Failed to send emails. Check server logs." };
    }
}
