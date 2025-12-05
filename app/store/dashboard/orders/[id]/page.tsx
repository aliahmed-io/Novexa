import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { FulfillmentCard } from "@/components/dashboard/FulfillmentCard";
import Image from "next/image";

async function getData(orderId: string) {
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            User: true,
            shipment: true,
        },
    });

    if (!order) return null;
    return order;
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    const order = await getData(id);

    if (!order) return notFound();

    return (
        <div className="flex flex-col gap-8 p-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
                <span className="text-muted-foreground">ID: {order.id}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                            <CardDescription>Products in this order</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Placeholder for order items - assuming we fetch them or they are in a relation */}
                            <p className="text-muted-foreground">Order items will be listed here (Need to update Order model to include OrderItems relation).</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Name:</span>
                                <span>{order.User?.firstName} {order.User?.lastName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Email:</span>
                                <span>{order.User?.email}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <FulfillmentCard orderId={order.id} shipment={order.shipment} />

                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{formatCurrency(order.amount / 100)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Status</span>
                                <span className="capitalize">{order.status}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
