"use server";

import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

const discountSchema = z.object({
    code: z.string().min(3).max(20).toUpperCase(),
    percentage: z.number().min(1).max(100),
    isActive: z.boolean().optional(),
    expiresAt: z.string().optional(), // We'll handle date parsing
});

export async function createDiscount(prevState: unknown, formData: FormData) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alihassan182006@gmail.com") {
        return redirect("/store/shop");
    }

    const submission = parseWithZod(formData, {
        schema: discountSchema,
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    // Check for uniqueness
    const existing = await prisma.discount.findUnique({
        where: { code: submission.value.code },
    });

    if (existing) {
        return submission.reply({
            formErrors: ["Discount code already exists"],
        });
    }

    const expiresAt = submission.value.expiresAt ? new Date(submission.value.expiresAt) : null;

    await prisma.discount.create({
        data: {
            code: submission.value.code,
            percentage: submission.value.percentage,
            isActive: submission.value.isActive ?? true,
            expiresAt: expiresAt,
        },
    });

    await logAudit({
        userId: user.id,
        action: "CREATE",
        targetType: "DISCOUNT",
        metadata: { code: submission.value.code, percentage: submission.value.percentage },
    });

    return redirect("/store/dashboard/discounts");
}

export async function toggleDiscountStatus(id: string, currentStatus: boolean) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alihassan182006@gmail.com") {
        return redirect("/store/shop");
    }

    await prisma.discount.update({
        where: { id },
        data: { isActive: !currentStatus },
    });

    await logAudit({
        userId: user.id,
        action: "UPDATE",
        targetType: "DISCOUNT",
        targetId: id,
        metadata: { field: "isActive", newValue: !currentStatus },
    });

    revalidatePath("/store/dashboard/discounts");
}

export async function deleteDiscount(id: string) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alihassan182006@gmail.com") {
        return redirect("/store/shop");
    }

    await prisma.discount.delete({
        where: { id },
    });

    await logAudit({
        userId: user.id,
        action: "DELETE",
        targetType: "DISCOUNT",
        targetId: id,
    });

    revalidatePath("/store/dashboard/discounts");
}
