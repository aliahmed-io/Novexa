
"use client";

import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { addressSchema } from "@/lib/zodSchemas"; // We need to add this schema
import { createAddress } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubmitButton } from "@/components/SubmitButtons";

export function AddressForm({ userId }: { userId: string }) {
    const [lastResult, action] = useActionState(createAddress, undefined);
    const [form, fields] = useForm({
        lastResult,
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: addressSchema });
        },
        shouldValidate: "onBlur",
        shouldRevalidate: "onInput",
    });

    return (
        <form id={form.id} onSubmit={form.onSubmit} action={action} className="space-y-4 max-w-xl">
            <input type="hidden" name="userId" value={userId} />

            <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input name={fields.name.name} defaultValue={fields.name.initialValue as string} placeholder="John Doe" />
                    <p className="text-red-500 text-sm">{fields.name.errors}</p>
                </div>

                <div className="space-y-2">
                    <Label>Street Address</Label>
                    <Input name={fields.street1.name} defaultValue={fields.street1.initialValue as string} placeholder="123 Main St" />
                    <p className="text-red-500 text-sm">{fields.street1.errors}</p>
                </div>

                <div className="space-y-2">
                    <Label>Apartment, suite, etc. (optional)</Label>
                    <Input name={fields.street2.name} defaultValue={fields.street2.initialValue as string} placeholder="Apt 4B" />
                    <p className="text-red-500 text-sm">{fields.street2.errors}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>City</Label>
                        <Input name={fields.city.name} defaultValue={fields.city.initialValue as string} placeholder="New York" />
                        <p className="text-red-500 text-sm">{fields.city.errors}</p>
                    </div>
                    <div className="space-y-2">
                        <Label>State / Province</Label>
                        <Input name={fields.state.name} defaultValue={fields.state.initialValue as string} placeholder="NY" />
                        <p className="text-red-500 text-sm">{fields.state.errors}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Postal Code</Label>
                        <Input name={fields.postalCode.name} defaultValue={fields.postalCode.initialValue as string} placeholder="10001" />
                        <p className="text-red-500 text-sm">{fields.postalCode.errors}</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Country</Label>
                        <Select name={fields.country.name} defaultValue={fields.country.initialValue as string || "US"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                                <SelectItem value="UK">United Kingdom</SelectItem>
                                <SelectItem value="AU">Australia</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-red-500 text-sm">{fields.country.errors}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Phone (Optional)</Label>
                    <Input name={fields.phone.name} defaultValue={fields.phone.initialValue as string} placeholder="+1 (555) 000-0000" />
                    <p className="text-red-500 text-sm">{fields.phone.errors}</p>
                </div>
            </div>

            <SubmitButton text="Save Address" />
        </form>
    );
}
