import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import prisma from "@/lib/db";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

async function getData() {
    const data = await prisma.category.findMany({
        orderBy: {
            createdAt: "desc",
        },
        include: {
            _count: {
                select: {
                    products: true,
                },
            },
        },
    });

    return data;
}

export default async function CategoriesPage() {
    noStore();
    const data = await getData();
    return (
        <>
            <div className="flex items-center justify-end">
                <Button asChild className="flex items-center gap-x-2">
                    <Link href="/store/dashboard/categories/create">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span>Add Category</span>
                    </Link>
                </Button>
            </div>
            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>
                        Manage your product categories
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-end">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell className="max-w-xs truncate" title={item.description || ""}>
                                        {item.description || "No description"}
                                    </TableCell>
                                    <TableCell>{item._count.products}</TableCell>
                                    <TableCell>
                                        {new Intl.DateTimeFormat("en-US").format(item.createdAt)}
                                    </TableCell>
                                    <TableCell className="text-end">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/store/dashboard/categories/${item.id}`}>
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                {item.slug !== "general" && (
                                                    <DropdownMenuItem asChild>
                                                        <Link
                                                            href={`/store/dashboard/categories/${item.id}/delete`}
                                                        >
                                                            Delete
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
