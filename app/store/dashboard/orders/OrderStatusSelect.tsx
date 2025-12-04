"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateOrderStatus } from "./actions";
import { toast } from "sonner";

interface OrderStatusSelectProps {
    orderId: string;
    currentStatus: string;
}

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
    const handleStatusChange = async (value: string) => {
        const result = await updateOrderStatus(orderId, value);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Order status updated");
        }
    };

    return (
        <Select defaultValue={currentStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
        </Select>
    );
}
