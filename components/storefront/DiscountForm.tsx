"use client";

import { applyDiscount, removeDiscount } from "@/app/store/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, X } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending} size="sm">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                </>
            ) : (
                "Apply"
            )}
        </Button>
    );
}

export function DiscountForm() {
    return (
        <form action={applyDiscount} className="flex flex-col gap-2">
            <Label htmlFor="code">Discount Code</Label>
            <div className="flex gap-2">
                <Input
                    id="code"
                    name="code"
                    placeholder="Enter discount code"
                    className="max-w-xs"
                    required
                />
                <SubmitButton />
            </div>
        </form>
    );
}

export function RemoveDiscountButton() {
    return (
        <form action={removeDiscount}>
            <Button type="submit" variant="ghost" size="icon" className="h-6 w-6">
                <X className="h-4 w-4" />
                <span className="sr-only">Remove discount</span>
            </Button>
        </form>
    );
}
