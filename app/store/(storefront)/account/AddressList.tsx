
"use client";

import { Address } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteAddress } from "./actions"; // We will create this
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddressListProps {
    addresses: Address[];
    userId: string;
}

export function AddressList({ addresses, userId }: AddressListProps) {
    const router = useRouter();

    const handleDelete = async (addressId: string) => {
        if (confirm("Are you sure you want to delete this address?")) {
            const res = await deleteAddress(addressId);
            if (res.success) {
                toast.success("Address deleted");
                router.refresh();
            } else {
                toast.error("Failed to delete address");
            }
        }
    };

    if (addresses.length === 0) {
        return <p className="text-sm text-gray-500">No addresses saved yet.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
                <Card key={address.id} className="p-4 relative">
                    <div className="text-sm">
                        <p className="font-medium">{address.name}</p>
                        <p>{address.street1}</p>
                        {address.street2 && <p>{address.street2}</p>}
                        <p>{address.city}, {address.state} {address.postalCode}</p>
                        <p>{address.country}</p>
                        {address.phone && <p className="text-gray-500 mt-1">{address.phone}</p>}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(address.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </Card>
            ))}
        </div>
    );
}
