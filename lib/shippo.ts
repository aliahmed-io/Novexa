import { Shippo } from "shippo";

const shippo = new Shippo({
    apiKeyHeader: process.env.SHIPPO_API_KEY || "shippo_test_12345", // Fallback for dev
});

export async function getShippingRates(
    addressTo: {
        name: string;
        street1: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        email: string;
    },
    addressFrom: {
        name: string;
        street1: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        email: string;
    } = {
            name: "Novexa Store",
            street1: "123 Fashion St",
            city: "San Francisco",
            state: "CA",
            zip: "94105",
            country: "US",
            email: "support@novexa.com",
        },
    parcel: {
        length: string;
        width: string;
        height: string;
        distanceUnit: "in" | "cm";
        weight: string;
        massUnit: "lb" | "kg";
    } = {
            length: "10",
            width: "6",
            height: "4",
            distanceUnit: "in",
            weight: "2",
            massUnit: "lb",
        }
) {
    try {
        const shipment = await shippo.shipments.create({
            addressFrom: addressFrom,
            addressTo: addressTo,
            parcels: [parcel],
            async: false,
        });

        return shipment.rates;
    } catch (error) {
        console.error("Error fetching rates:", error);
        throw new Error("Failed to fetch shipping rates");
    }
}

export async function purchaseLabel(rateId: string) {
    try {
        const transaction = await shippo.transactions.create({
            rate: rateId,
            labelFileType: "PDF",
            async: false,
        });

        return transaction;
    } catch (error) {
        console.error("Error purchasing label:", error);
        throw new Error("Failed to purchase shipping label");
    }
}
