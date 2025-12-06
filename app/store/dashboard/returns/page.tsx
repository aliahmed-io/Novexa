
import prisma from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { approveReturn, rejectReturn } from "./actions"; // We need to create this

async function getData() {
    const data = await prisma.returnRequest.findMany({
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true
                }
            },
            order: {
                select: {
                    amount: true
                }
            }
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return data;
}

export default async function AdminReturnsPage() {
    const data = await getData();

    return (
        <Card>
            <CardHeader className="px-7">
                <CardTitle>Return Requests</CardTitle>
                <CardDescription>Manage customer return requests.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <p className="font-medium">{item.user.firstName} {item.user.lastName}</p>
                                    <p className="text-xs text-muted-foreground">{item.user.email}</p>
                                </TableCell>
                                <TableCell>
                                    <Link href={`/store/dashboard/orders/${item.orderId}`} className="hover:underline">
                                        {item.orderId}
                                    </Link>
                                </TableCell>
                                <TableCell className="max-w-xs truncate" title={item.reason}>
                                    {item.reason}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={item.status === "PENDING" ? "secondary" : item.status === "APPROVED" ? "default" : "destructive"}>
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    {item.status === "PENDING" && (
                                        <div className="flex justify-end gap-2">
                                            <form action={approveReturn.bind(null, item.id)}>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500">
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                            </form>
                                            <form action={rejectReturn.bind(null, item.id)}>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500">
                                                    <XCircle className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
