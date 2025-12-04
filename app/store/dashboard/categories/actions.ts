"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { categorySchema } from "@/lib/zodSchemas";
import prisma from "@/lib/db";

export async function createCategory(prevState: unknown, formData: FormData) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alihassan182006@gmail.com") {
        return redirect("/store/shop");
    }

    const submission = parseWithZod(formData, {
        schema: categorySchema,
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    await prisma.category.create({
        data: {
            name: submission.value.name,
            slug: submission.value.name.toLowerCase().replace(/ /g, "-"),
            description: submission.value.description,
            image: submission.value.image,
        },
    });

    return redirect("/store/dashboard/categories");
}

export async function editCategory(prevState: unknown, formData: FormData) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alihassan182006@gmail.com") {
        return redirect("/store/shop");
    }

    const submission = parseWithZod(formData, {
        schema: categorySchema,
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    const categoryId = formData.get("categoryId") as string;

    await prisma.category.update({
        where: {
            id: categoryId,
        },
        data: {
            name: submission.value.name,
            slug: submission.value.name.toLowerCase().replace(/ /g, "-"),
            description: submission.value.description,
            image: submission.value.image,
        },
    });

    return redirect("/store/dashboard/categories");
}

export async function deleteCategory(formData: FormData) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || user.email !== "alihassan182006@gmail.com") {
        return redirect("/store/shop");
    }

    const categoryId = formData.get("categoryId") as string;

    const category = await prisma.category.findUnique({
        where: {
            id: categoryId,
        },
    });

    if (category?.slug === "general") {
        return redirect("/store/dashboard/categories");
    }

    await prisma.category.delete({
        where: {
            id: categoryId,
        },
    });

    return redirect("/store/dashboard/categories");
}
