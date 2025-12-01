import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, FileUp } from "lucide-react";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { ExportButton } from "@/components/Dashboard/ExportButton";
import { BulkEditTable } from "@/components/Dashboard/BulkEditTable";

async function getData() {
  const data = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return data;
}

export default async function ProductsRoute() {
  noStore();
  const data = await getData();
  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button asChild variant="secondary" className="flex items-center gap-x-2">
          <Link href="/store/dashboard/products/import">
            <FileUp className="w-3.5 h-3.5" />
            <span>Import</span>
          </Link>
        </Button>
        <ExportButton />
        <Button asChild className="flex items-center gap-x-2">
          <Link href="/store/dashboard/products/create">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </Link>
        </Button>
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your products and view their sales performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BulkEditTable data={data} />
        </CardContent>
      </Card>
    </>
  );
}