
"use client";

import { useActionState, useEffect } from "react";
import { subscribeToNewsletter } from "@/app/api/newsletter/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SubmitButton } from "@/components/SubmitButtons";

export function FooterForm() {
    const [state, action] = useActionState(subscribeToNewsletter, null);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
        } else if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <form action={action} className="mt-6 sm:flex sm:max-w-md">
            <label htmlFor="email-address" className="sr-only">
                Email address
            </label>
            <Input
                type="email"
                name="email"
                id="email-address"
                autoComplete="email"
                required
                placeholder="Enter your email"
                className="w-full min-w-0"
            />
            <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                <SubmitButton text="Subscribe" />
            </div>
        </form>
    );
}
