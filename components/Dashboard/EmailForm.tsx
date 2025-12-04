"use client";

import { sendBroadcastEmail } from "@/app/store/dashboard/email/actions";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                </>
            ) : (
                "Send Broadcast"
            )}
        </Button>
    );
}

export function EmailForm() {
    const ref = useRef<HTMLFormElement>(null);

    const handleSubmit = async (formData: FormData) => {
        const result = await sendBroadcastEmail(formData);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Broadcast email sent successfully!");
            ref.current?.reset();
        }
    };

    return (
        <form ref={ref} action={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Send Broadcast Email</CardTitle>
                    <CardDescription>
                        Send an email announcement to all registered users.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            name="subject"
                            placeholder="Enter email subject"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            name="message"
                            placeholder="Enter your message here..."
                            className="min-h-[200px]"
                            required
                        />
                    </div>
                    <SubmitButton />
                </CardContent>
            </Card>
        </form>
    );
}
