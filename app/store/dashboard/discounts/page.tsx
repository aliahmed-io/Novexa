import Link from "next/link";
import { Plus, Trash2, Power, PowerOff } from "lucide-react";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { deleteDiscount, toggleDiscountStatus } from "./actions";

async function getData() {
    const data = await prisma.discount.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
    return data;
}

export default async function DiscountsPage() {
    const data = await getData();

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Discounts</h1>
                    <p className="text-muted-foreground mt-2">Manage your promo codes and offers.</p>
                </div>
                <Button asChild>
                    <Link href="/store/dashboard/discounts/create">
                        <Plus className="mr-2 h-4 w-4" /> Create Discount
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Discounts</CardTitle>
                    <CardDescription>
                        View and manage all coupons.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Percentage</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Expires</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No discounts found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono font-medium">{item.code}</TableCell>
                                        <TableCell>{item.percentage}%</TableCell>
                                        <TableCell>
                                            <Badge variant={item.isActive ? "default" : "secondary"}>
                                                {item.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {item.expiresAt ? format(item.expiresAt, "PPP") : "Never"}
                                        </TableCell>
                                        <TableCell>{format(item.createdAt, "PPP")}</TableCell>
                                        <TableCell className="text-right">
                                            <form action={toggleDiscountStatus.bind(null, item.id, item.isActive)} className="inline-block mr-2">
                                                <Button size="icon" variant="ghost" title={item.isActive ? "Deactivate" : "Activate"}>
                                                    {item.isActive ? <Power className="h-4 w-4 text-green-600" /> : <PowerOff className="h-4 w-4 text-gray-400" />}
                                                </Button>
                                            </form>
                                            <form action={deleteDiscount.bind(null, item.id)} className="inline-block">
                                                <Button size="icon" variant="ghost" className="text-red-500">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </section>
    );
}
