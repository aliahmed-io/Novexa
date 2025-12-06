
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/formatters";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck, MapPin, Package, ArrowLeft } from "lucide-react";

async function getData(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
            userId: userId, // Ensure user owns the order
        },
        include: {
            orderItems: true,
            shipment: true,
        },
    });

    if (!order) {
        return null; // Handle 404
    }
    return order;
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/store/api/auth/login");
    }

    const order = await getData(params.id, user.id);

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h2 className="text-2xl font-bold">Order not found</h2>
                <Button asChild>
                    <Link href="/store/orders">Back to Orders</Link>
                </Button>
            </div>
        );
    }

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <Button asChild variant="ghost" className="mb-6">
                <Link href="/store/orders">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
                </Link>
            </Button>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                            <CardDescription>Order ID: {order.id}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.orderItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 py-4 border-b last:border-0">
                                    <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted">
                                        {item.image ? (
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(item.price / 100)}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{formatCurrency(order.amount / 100)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" /> Shipping Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-1 text-muted-foreground">
                            <p className="font-medium text-foreground">{order.shippingName}</p>
                            <p>{order.shippingStreet1}</p>
                            {order.shippingStreet2 && <p>{order.shippingStreet2}</p>}
                            <p>{order.shippingCity}, {order.shippingState} {order.shippingPostalCode}</p>
                            <p>{order.shippingCountry}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" /> Shipping Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <Badge variant="secondary" className="capitalize">{order.status}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Service</span>
                                <span className="text-sm font-medium">{order.shippingServiceLevel || "Standard"}</span>
                            </div>
                            {order.shipment?.trackingNumber && (
                                <div className="pt-2 border-t">
                                    <p className="text-xs text-muted-foreground mb-2">Tracking Number:</p>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                                            {order.shipment.trackingNumber}
                                        </code>
                                    </div>
                                    {order.shipment.shippoId && (
                                        <Button asChild size="sm" variant="link" className="px-0 mt-2">
                                            <a href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.shipment.trackingNumber}`} target="_blank" rel="noopener noreferrer">
                                                Track on Carrier Site
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            )}

                            {order.status === "delivered" && (
                                <div className="pt-4 border-t mt-4">
                                    <Button asChild variant="outline" className="w-full">
                                        <Link href={`/store/orders/${order.id}/return`}>
                                            Request Return
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
