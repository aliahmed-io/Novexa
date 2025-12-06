
"use client";

import { useActionState } from "react";
import { submitReturnRequest } from "./actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitButton } from "@/components/SubmitButtons";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ReturnRequestPage({ params }: { params: { id: string } }) {
    const [state, action] = useActionState(submitReturnRequest, null);
    const router = useRouter();

    useEffect(() => {
        if (state?.success) {
            toast.success("Return request submitted successfully");
            router.push("/store/orders");
        } else if (state?.error) {
            toast.error(state.error);
        }
    }, [state, router]);

    return (
        <div className="max-w-xl mx-auto py-10 px-4">
            <Card>
                <CardHeader>
                    <CardTitle>Request Return</CardTitle>
                    <CardDescription>
                        Please explain why you would like to return this order (ID: {params.id}).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-4">
                        <input type="hidden" name="orderId" value={params.id} />

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Return</Label>
                            <Textarea
                                id="reason"
                                name="reason"
                                placeholder="Wrong size, damaged, changed mind, etc..."
                                required
                                className="min-h-[100px]"
                            />
                        </div>

                        <SubmitButton text="Submit Request" />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
