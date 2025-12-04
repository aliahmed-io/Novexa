"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface iAppProps {
    categories?: {
        id: string;
        name: string;
        slug: string;
    }[];
}

export function FilterComponent({ categories }: iAppProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get current values
    const currentSort = searchParams.get("sort") || "";
    const currentPrice = searchParams.get("price") || "";
    const currentColor = searchParams.get("color") || "";
    const currentCategory = searchParams.get("category") || "";

    // Helper to update URL
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value && value !== "all") {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleSortChange = (value: string) => {
        router.push("?" + createQueryString("sort", value));
    };

    const handlePriceChange = (value: string) => {
        router.push("?" + createQueryString("price", value));
    };

    const handleColorChange = (value: string) => {
        router.push("?" + createQueryString("color", value));
    };

    const handleCategoryChange = (value: string) => {
        // If we select a sub-category, we might want to navigate to that category page directly?
        // OR we just filter by it if the backend supports it.
        // The user said: "in the user main category page we add another filter by category which lists all categories the admin created."
        // So if I am on "Men", I filter by "Sneakers".
        // But my backend logic for `getData` handles `productCategory` (the path param) OR `category` (search param)?
        // Wait, `getData` checks `productCategory` (path param).
        // It does NOT check `searchParams.category`.

        // I need to update `getData` to ALSO check `searchParams.category` if it's provided.
        // But for now, let's implement the UI.
        router.push("?" + createQueryString("category", value));
    };

    const clearFilters = () => {
        router.push(window.location.pathname);
    };

    const hasFilters = currentSort || currentPrice || currentColor || currentCategory;

    return (
        <div className="bg-white p-4 rounded-lg border shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-end flex-wrap">
                {/* Sort By */}
                <div className="w-full md:w-48">
                    <Label className="mb-2 block text-sm font-medium">Sort By</Label>
                    <Select value={currentSort} onValueChange={handleSortChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest</SelectItem>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            <SelectItem value="popularity">Popularity</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Sub Category Filter */}
                {categories && categories.length > 0 && (
                    <div className="w-full md:w-48">
                        <Label className="mb-2 block text-sm font-medium">Sub Category</Label>
                        <Select value={currentCategory} onValueChange={handleCategoryChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.slug}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Price Filter */}
                <div className="w-full md:w-48">
                    <Label className="mb-2 block text-sm font-medium">Price Range</Label>
                    <Select value={currentPrice} onValueChange={handlePriceChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Price" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Prices</SelectItem>
                            <SelectItem value="under-50">Under $50</SelectItem>
                            <SelectItem value="50-100">$50 - $100</SelectItem>
                            <SelectItem value="100-200">$100 - $200</SelectItem>
                            <SelectItem value="over-200">Over $200</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Color Filter */}
                <div className="w-full md:w-48">
                    <Label className="mb-2 block text-sm font-medium">Color</Label>
                    <Select value={currentColor} onValueChange={handleColorChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Color" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Colors</SelectItem>
                            <SelectItem value="black">Black</SelectItem>
                            <SelectItem value="white">White</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="yellow">Yellow</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="orange">Orange</SelectItem>
                            <SelectItem value="grey">Grey</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Clear Filters */}
                {hasFilters && (
                    <div className="w-full md:w-auto pb-0.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
