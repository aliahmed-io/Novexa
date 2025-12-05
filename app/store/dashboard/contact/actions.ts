"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateContactStatus(id: string, status: "PENDING" | "COMPLETED" | "IGNORED") {
    try {
        await prisma.contact.update({
            where: { id },
            data: { status },
        });
        revalidatePath("/store/dashboard/contact");
        return { success: true };
    } catch (error) {
        return { error: "Failed to update status" };
    }
}

export async function markAllAsRead() {
    try {
        await prisma.contact.updateMany({
            where: { isRead: false },
            data: { isRead: true },
        });
        revalidatePath("/store/dashboard", "layout");
        return { success: true };
    } catch (error) {
        return { error: "Failed to mark as read" };
    }
}
