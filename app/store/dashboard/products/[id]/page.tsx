import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import prisma from "@/lib/db";
import { EditForm } from "@/components/Dashboard/EditForm";

async function getData(productId: string) {
  const data = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!data) {
    return notFound();
  }

  return data;
}

async function getCategories() {
  const data = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return data;
}

export default async function EditRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const data = await getData(id);
  const categories = await getCategories();
  return <EditForm data={data} categories={categories} />;
}