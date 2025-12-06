import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, Calendar, CreditCard } from "lucide-react";

async function getData(userId: string) {
    const data = await prisma.order.findMany({
        where: {
            userId: userId,
        },
        select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return data;
}

export default async function OrdersPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/store/api/auth/login");
    }

    const data = await getData(user.id);

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
                <Button asChild variant="outline">
                    <Link href="/store/shop">Continue Shopping</Link>
                </Button>
            </div>

            {data.length === 0 ? (
                <Card className="flex flex-col items-center justify-center p-10 text-center min-h-[400px]">
                    <div className="bg-primary/10 p-6 rounded-full mb-4">
                        <Package className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold mt-4">No orders found</h2>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        You haven't placed any orders yet. Start shopping to see your orders here.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/store/shop">Start Shopping</Link>
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {data.map((order) => (
                        <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex items-center justify-between">
                                    <Badge
                                        className={`capitalize ${order.status === "pending"
                                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                            : order.status === "shipped"
                                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                                : order.status === "delivered"
                                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                            }`}
                                        variant="secondary"
                                    >
                                        {order.status}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground font-medium">
                                        {new Intl.DateTimeFormat("en-US", {
                                            dateStyle: "medium",
                                        }).format(order.createdAt)}
                                    </span>
                                </div>
                                <CardTitle className="mt-2 flex items-center gap-2 text-lg">
                                    <span className="truncate text-base font-normal text-muted-foreground">Order ID:</span>
                                    <span className="text-base">{order.id.slice(0, 8)}...</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <CreditCard className="h-4 w-4" />
                                        <span className="text-sm">Total Amount</span>
                                    </div>
                                    <span className="text-xl font-bold">
                                        {formatCurrency(order.amount / 100)}
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/10 border-t p-4 flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">
                                    {order.status === "pending" ? "Processing order" : "Check details ->"}
                                </p>
                                <Button asChild size="sm" variant="secondary">
                                    <Link href={`/store/orders/${order.id}`}>View Details</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </section>
    );
}
