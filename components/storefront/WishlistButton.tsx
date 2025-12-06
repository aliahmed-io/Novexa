
"use client";

import { useTransition, useState, useEffect } from "react";
import { toggleWishlist, getWishlistStatus } from "@/app/store/wishlist/actions";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WishlistButtonProps {
    productId: string;
}

export function WishlistButton({ productId }: WishlistButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getWishlistStatus(productId).then((status) => {
            setIsWishlisted(status);
            setIsLoading(false);
        });
    }, [productId]);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent linking to product page if button is clicked
        e.stopPropagation();

        startTransition(async () => {
            const res = await toggleWishlist(productId);
            if (res.success) {
                setIsWishlisted(res.isWishlisted!);
                toast.success(res.isWishlisted ? "Added to wishlist" : "Removed from wishlist");
            } else {
                toast.error(res.error || "Something went wrong");
            }
        });
    };

    if (isLoading) {
        return (
            <Button variant="ghost" size="icon" disabled className="rounded-full">
                <Heart className="w-5 h-5 opacity-50" />
            </Button>
        )
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            disabled={isPending}
            className="rounded-full hover:bg-muted"
        >
            <Heart
                className={cn(
                    "w-5 h-5 transition-colors",
                    isWishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"
                )}
            />
        </Button>
    );
}
