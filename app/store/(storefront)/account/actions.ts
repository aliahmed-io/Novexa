
"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { parseWithZod } from "@conform-to/zod";
import { addressSchema } from "@/lib/zodSchemas";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function createAddress(prevState: unknown, formData: FormData) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return { status: "error" as const, error: { "": ["Unauthorized"] } };
    }

    const submission = parseWithZod(formData, {
        schema: addressSchema,
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    await prisma.address.create({
        data: {
            ...submission.value,
            userId: user.id,
        },
    });

    revalidatePath("/store/account");
    return submission.reply({ resetForm: true });
}

export async function deleteAddress(addressId: string) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Ensure user owns the address
    const address = await prisma.address.findUnique({
        where: { id: addressId },
    });

    if (!address || address.userId !== user.id) {
        return { success: false, error: "Not found or unauthorized" };
    }

    await prisma.address.delete({
        where: { id: addressId },
    });

    revalidatePath("/store/account");
    return { success: true };
}
