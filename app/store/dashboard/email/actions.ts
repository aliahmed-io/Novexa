"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { resend } from "@/lib/resend";
import { BroadcastEmail } from "@/components/emails/BroadcastEmail";
import { logAudit } from "@/lib/audit";

export async function sendBroadcastEmail(formData: FormData) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alihassan182006@gmail.com") {
        return redirect("/store/shop");
    }

    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const audience = formData.get("audience") as string;
    const specificEmailsJson = formData.get("specificEmails") as string;

    if (!subject || !message) {
        return { error: "Subject and message are required" };
    }

    try {
        let users: { email: string }[] = [];

        if (audience === "all") {
            users = await prisma.user.findMany({
                select: { email: true },
            });
        } else if (audience === "newsletter") {
            const subscribers = await prisma.newsletterSubscriber.findMany({
                where: { status: "subscribed" },
                select: { email: true },
            });
            users = subscribers.map(sub => ({ email: sub.email }));
        } else if (audience === "specific") {
            if (!specificEmailsJson) {
                return { error: "Specific recipients are required" };
            }
            try {
                const emails = JSON.parse(specificEmailsJson) as string[];
                users = emails.map(email => ({ email }));
            } catch (e) {
                return { error: "Invalid recipient data" };
            }
        }

        const fromEmail = "Novexa <onboarding@resend.dev>";

        // Filter out users with no email (just in case)
        const validUsers = users.filter((u) => u.email);

        if (validUsers.length === 0) {
            return { error: "No users found for the selected audience." };
        }

        const emailPromises = validUsers.map((u) =>
            resend.emails.send({
                from: fromEmail,
                to: u.email,
                subject: subject,
                react: BroadcastEmail({ subject, message, imageUrl, recipientEmail: u.email }),
            })
        );

        await Promise.all(emailPromises);

        await logAudit({
            userId: user.id,
            action: "SEND_BROADCAST",
            targetType: "EMAIL",
            metadata: { subject, audience, recipients: validUsers.length },
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send broadcast:", error);
        return { error: "Failed to send emails. Check server logs." };
    }
}
