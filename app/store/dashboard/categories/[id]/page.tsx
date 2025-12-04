import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { EditCategoryForm } from "./EditCategoryForm";
import { unstable_noStore as noStore } from "next/cache";

async function getData(categoryId: string) {
    const data = await prisma.category.findUnique({
        where: {
            id: categoryId,
        },
    });

    if (!data) {
        return notFound();
    }

    return data;
}

export default async function EditCategoryRoute({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    noStore();
    const { id } = await params;
    const data = await getData(id);

    return <EditCategoryForm data={data} />;
}
