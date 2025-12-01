import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function CancelRoute() {
    return (
        <section className="h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-[400px] mx-auto p-6 bg-background rounded-lg border shadow-sm text-center">
                <div className="w-full flex justify-center mb-4">
                    <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center">
                        <XCircle className="h-10 w-10 text-red-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
                <p className="text-muted-foreground mb-6">
                    Something went wrong with your payment. You haven't been charged.
                </p>

                <Button asChild className="w-full">
                    <Link href="/store/bag">Return to Bag</Link>
                </Button>
            </div>
        </section>
    );
}
