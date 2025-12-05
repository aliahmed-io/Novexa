"use client";

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
import { submitContactForm } from "./actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                </>
            ) : (
                "Send Message"
            )}
        </Button>
    );
}

export default function ContactPage() {
    const [state, formAction] = useActionState(submitContactForm, null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.success) {
            toast.success("Message sent successfully!");
            formRef.current?.reset();
        } else if (state?.error && typeof state.error === "string") {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Contact Us</CardTitle>
                    <CardDescription>
                        Have a question or feedback? We'd love to hear from you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} action={formAction} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Your name"
                                    defaultValue={state?.fields?.name}
                                    required
                                />
                                {state?.error && typeof state.error !== "string" && state.error.name && (
                                    <p className="text-sm text-red-500">{state.error.name[0]}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    defaultValue={state?.fields?.email}
                                    required
                                />
                                {state?.error && typeof state.error !== "string" && state.error.email && (
                                    <p className="text-sm text-red-500">{state.error.email[0]}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                name="subject"
                                placeholder="What is this regarding?"
                                defaultValue={state?.fields?.subject}
                                required
                            />
                            {state?.error && typeof state.error !== "string" && state.error.subject && (
                                <p className="text-sm text-red-500">{state.error.subject[0]}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                name="message"
                                placeholder="Your message..."
                                className="min-h-[150px]"
                                defaultValue={state?.fields?.message}
                                required
                            />
                            {state?.error && typeof state.error !== "string" && state.error.message && (
                                <p className="text-sm text-red-500">{state.error.message[0]}</p>
                            )}
                        </div>

                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
