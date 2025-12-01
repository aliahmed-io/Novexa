import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import Link from "next/link";

export default function SuccessRoute() {
    return (
        <section className="h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-[400px] mx-auto p-6 bg-background rounded-lg border shadow-sm text-center">
                <div className="w-full flex justify-center mb-4">
                    <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                        <CheckCheck className="h-10 w-10 text-green-500" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-muted-foreground mb-6">
                    Thank you for your purchase. We hope you enjoy your product.
                </p>

                <Button asChild className="w-full">
                    <Link href="/store/shop">Back to Shop</Link>
                </Button>
            </div>
        </section>
    );
}
