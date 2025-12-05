import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4 text-center">
            <div className="space-y-4">
                <h1 className="text-9xl font-extrabold tracking-tighter text-primary/20">
                    404
                </h1>
                <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Page not found
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                    Sorry, we couldn't find the page you're looking for. It might have been
                    moved, deleted, or never existed.
                </p>
                <div className="flex justify-center gap-4 pt-4">
                    <Button asChild size="lg">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
