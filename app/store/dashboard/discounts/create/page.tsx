"use client";

import { useActionState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import { createDiscount } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "@/components/SubmitButtons";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const discountSchema = z.object({
    code: z.string().min(3).max(20).toUpperCase(),
    percentage: z.number().min(1).max(100),
    isActive: z.boolean().optional(),
    expiresAt: z.string().optional(),
});

export default function CreateDiscountPage() {
    const [lastResult, action] = useActionState(createDiscount, undefined);
    const [form, fields] = useForm({
        lastResult,
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: discountSchema });
        },
        shouldValidate: "onBlur",
        shouldRevalidate: "onInput",
    });

    return (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/store/dashboard/discounts">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Discount</h1>
                    <p className="text-muted-foreground">Add a new promo code.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Discount Details</CardTitle>
                    <CardDescription>Define your discount rules.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form id={form.id} onSubmit={form.onSubmit} action={action} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Discount Code</Label>
                            <Input
                                name={fields.code.name}
                                defaultValue={fields.code.initialValue as string}
                                placeholder="SUMMER2024"
                                className="uppercase"
                            />
                            <p className="text-red-500 text-sm">{fields.code.errors}</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Percentage Off (%)</Label>
                            <Input
                                type="number"
                                name={fields.percentage.name}
                                defaultValue={fields.percentage.initialValue as string}
                                placeholder="15"
                                min={1}
                                max={100}
                            />
                            <p className="text-red-500 text-sm">{fields.percentage.errors}</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Expiration Date (Optional)</Label>
                            <Input
                                type="date"
                                name={fields.expiresAt.name}
                                defaultValue={fields.expiresAt.initialValue as string}
                            />
                            <p className="text-red-500 text-sm">{fields.expiresAt.errors}</p>
                        </div>

                        <div className="flex items-center justify-between border p-4 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Active Status</Label>
                                <p className="text-sm text-muted-foreground">Enable this discount immediately.</p>
                            </div>
                            <Switch
                                name={fields.isActive.name}
                                defaultChecked={true}
                                value="on"
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button variant="outline" asChild>
                                <Link href="/store/dashboard/discounts">Cancel</Link>
                            </Button>
                            <SubmitButton text="Create Discount" />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </section>
    );
}
