"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, Truck } from "lucide-react";
import { buyShippingLabel, fetchShippingRates } from "@/app/store/dashboard/orders/actions";
import { formatCurrency } from "@/lib/formatters";

interface FulfillmentCardProps {
    orderId: string;
    shipment?: {
        status: string;
        trackingNumber: string | null;
        labelUrl: string | null;
        carrier: string | null;
    } | null;
}

export function FulfillmentCard({ orderId, shipment }: FulfillmentCardProps) {
    const [loading, setLoading] = useState(false);
    const [rates, setRates] = useState<any[]>([]);
    const [selectedRate, setSelectedRate] = useState<string | null>(null);

    async function handleGetRates() {
        setLoading(true);
        try {
            const fetchedRates = await fetchShippingRates(orderId);
            setRates(fetchedRates);
        } catch (error) {
            console.error(error);
            alert("Failed to fetch rates");
        } finally {
            setLoading(false);
        }
    }

    async function handleBuyLabel() {
        if (!selectedRate) return;
        setLoading(true);
        try {
            await buyShippingLabel(orderId, selectedRate);
            // Refresh handled by server action revalidatePath
        } catch (error) {
            console.error(error);
            alert("Failed to buy label");
        } finally {
            setLoading(false);
        }
    }

    if (shipment?.status === "SHIPPED" || shipment?.status === "DELIVERED") {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-green-500" />
                        Order Shipped
                    </CardTitle>
                    <CardDescription>
                        Carrier: {shipment.carrier}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <div className="font-medium">Tracking Number:</div>
                        <div className="text-sm font-mono bg-muted p-2 rounded">{shipment.trackingNumber}</div>
                    </div>
                </CardContent>
                <CardFooter>
                    {shipment.labelUrl && (
                        <Button asChild variant="outline" className="w-full">
                            <a href={shipment.labelUrl} target="_blank" rel="noopener noreferrer">
                                Print Label
                            </a>
                        </Button>
                    )}
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Fulfillment
                </CardTitle>
                <CardDescription>Get shipping rates and buy labels</CardDescription>
            </CardHeader>
            <CardContent>
                {rates.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-muted-foreground mb-4">No rates fetched yet.</p>
                        <Button onClick={handleGetRates} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Get Shipping Rates
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            {rates.map((rate) => (
                                <div
                                    key={rate.object_id}
                                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${selectedRate === rate.object_id ? "border-primary bg-primary/5" : "hover:bg-muted"
                                        }`}
                                    onClick={() => setSelectedRate(rate.object_id)}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{rate.provider} - {rate.servicelevel.name}</span>
                                        <span className="text-xs text-muted-foreground">ETA: {rate.estimated_days} days</span>
                                    </div>
                                    <div className="font-bold">
                                        {formatCurrency(parseFloat(rate.amount))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
            {rates.length > 0 && (
                <CardFooter>
                    <Button className="w-full" onClick={handleBuyLabel} disabled={loading || !selectedRate}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Buy Label
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
