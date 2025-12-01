"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/assistantTypes";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    return (
        <Link href={`/store/product/${product.id}`} target="_blank" className="block">
            <Card className="w-40 flex-shrink-0 overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="relative h-32 w-full bg-muted">
                    {product.images?.[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="160px"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            No Image
                        </div>
                    )}
                </div>
                <CardContent className="p-2">
                    <h3 className="text-xs font-semibold truncate" title={product.name}>
                        {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                        {product.category}
                    </p>
                </CardContent>
                <CardFooter className="p-2 pt-0">
                    <p className="text-sm font-bold text-primary">${product.price}</p>
                </CardFooter>
            </Card>
        </Link>
    );
}
