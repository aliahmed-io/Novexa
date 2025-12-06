
import { getShippingRates } from "@/lib/shippo";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { addressTo } = body;

        if (!addressTo) {
            return NextResponse.json(
                { error: "Missing address information" },
                { status: 400 }
            );
        }

        const rates = await getShippingRates(addressTo);
        return NextResponse.json(rates);
    } catch (error) {
        console.error("Error fetching shipping rates:", error);
        return NextResponse.json(
            { error: "Failed to fetch shipping rates" },
            { status: 500 }
        );
    }
}
