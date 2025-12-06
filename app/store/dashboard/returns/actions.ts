
"use server";

import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";

// Helper to check admin
async function checkAdmin() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    if (!user || user.email !== "alihassan182006@gmail.com") {
        throw new Error("Unauthorized");
    }
}

export async function approveReturn(requestId: string) {
    await checkAdmin();

    await prisma.returnRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" },
    });

    revalidatePath("/store/dashboard/returns");
}

export async function rejectReturn(requestId: string) {
    await checkAdmin();

    await prisma.returnRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
    });

    revalidatePath("/store/dashboard/returns");
}
