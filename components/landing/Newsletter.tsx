"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Newsletter() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 -z-10" />
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto">
                    <div className="space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Stay in the Loop</h2>
                        <p className="text-muted-foreground text-lg">
                            Subscribe to our newsletter for exclusive offers, new drops, and style inspiration.
                        </p>
                    </div>

                    <form className="flex flex-col sm:flex-row gap-4 w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            className="h-12 bg-background border-input/50 focus-visible:ring-primary"
                        />
                        <Button type="submit" size="lg" className="h-12 px-8 rounded-md">
                            Subscribe
                        </Button>
                    </form>

                    <p className="text-xs text-muted-foreground">
                        By subscribing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </section>
    );
}
