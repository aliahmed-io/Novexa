"use client";

import { createProduct } from "@/app/store/actions";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, XIcon, Sparkles, MoreHorizontal, Wand2, ImagePlus } from "lucide-react";
import Link from "next/link";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { productSchema } from "@/lib/zodSchemas";
import { useActionState, useState } from "react";

import Image from "next/image";
import { UploadDropzone } from "@/lib/uploadthing";
import { SubmitButton } from "@/components/SubmitButtons";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Category } from "@prisma/client";

interface iAppProps {
    categories: Category[];
}

export function ProductCreateForm({ categories }: iAppProps) {
    const [images, setImages] = useState<string[]>([]);
    const [lastResult, action] = useActionState(createProduct, undefined);
    const [form, fields] = useForm({
        lastResult,

        onValidate({ formData }) {
            return parseWithZod(formData, { schema: productSchema });
        },

        shouldValidate: "onBlur",
        shouldRevalidate: "onInput",
    });

    const handleDelete = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateImage = async (mode: 'text' | 'sequence' | 'improve') => {
        setIsGenerating(true);
        const name = fields.name.initialValue as string;
        const description = fields.description.initialValue as string;
        const category = fields.category.initialValue as string;

        if (!name || !category) {
            alert("Please fill in Name and Category first.");
            setIsGenerating(false);
            return;
        }

        try {
            const { generateProductImage } = await import("@/app/store/dashboard/actions");
            const result = await generateProductImage(name, description || "", category, mode, images);

            if (result.success && result.imageUrl) {
                setImages((prev) => [...prev, result.imageUrl]);
            }
        } catch (error) {
            console.error("Error generating image:", error);
            alert("Failed to generate image");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <form id={form.id} onSubmit={form.onSubmit} action={action}>
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/store/dashboard/products">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold tracking-tight">New Product</h1>
            </div>

            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                    <CardDescription>
                        In this form you can create your product
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <Label>Name</Label>
                            <Input
                                type="text"
                                key={fields.name.key}
                                name={fields.name.name}
                                defaultValue={fields.name.initialValue}
                                className="w-full"
                                placeholder="Product Name"
                            />

                            <p className="text-red-500">{fields.name.errors}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label>Description</Label>
                            <Textarea
                                key={fields.description.key}
                                name={fields.description.name}
                                defaultValue={fields.description.initialValue}
                            />
                            <p className="text-red-500">{fields.description.errors}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label>Price</Label>
                            <Input
                                key={fields.price.key}
                                name={fields.price.name}
                                defaultValue={fields.price.initialValue}
                                type="number"
                                placeholder="Product Price"
                                min={1}
                            />
                            <p className="text-red-500">{fields.price.errors}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label>Discount Percentage</Label>
                            <Input
                                key={fields.discountPercentage.key}
                                name={fields.discountPercentage.name}
                                defaultValue={fields.discountPercentage.initialValue}
                                type="number"
                                placeholder="0"
                                min={0}
                                max={100}
                            />
                            <p className="text-red-500">{fields.discountPercentage.errors}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label>Featured Product</Label>
                            <Switch
                                key={fields.isFeatured.key}
                                name={fields.isFeatured.name}
                                defaultChecked={fields.isFeatured.initialValue === "on"}
                            />
                            <p className="text-red-500">{fields.isFeatured.errors}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label>Status</Label>
                            <Select
                                key={fields.status.key}
                                name={fields.status.name}
                                defaultValue={fields.status.initialValue}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-red-500">{fields.status.errors}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label>Main Category</Label>
                            <Select
                                key={fields.mainCategory.key}
                                name={fields.mainCategory.name}
                                defaultValue={fields.mainCategory.initialValue}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Main Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MEN">Men</SelectItem>
                                    <SelectItem value="WOMEN">Women</SelectItem>
                                    <SelectItem value="KIDS">Kids</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-red-500">{fields.mainCategory.errors}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label>Sub Category</Label>
                            <Select
                                key={fields.category.key}
                                name={fields.category.name}
                                defaultValue={fields.category.initialValue}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Sub Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-red-500">{fields.category.errors}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <Label>Images</Label>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            disabled={isGenerating}
                                            className="text-xs gap-1"
                                        >
                                            {isGenerating ? (
                                                <>Generating...</>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-3 h-3" />
                                                    Generate with AI
                                                </>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>AI Generation Modes</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleGenerateImage('text')}>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate from Scratch
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleGenerateImage('sequence')}
                                            disabled={images.length === 0}
                                        >
                                            <ImagePlus className="w-4 h-4 mr-2" />
                                            Complete Sequence
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleGenerateImage('improve')}
                                            disabled={images.length === 0}
                                        >
                                            <Wand2 className="w-4 h-4 mr-2" />
                                            Improve Quality
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <input
                                type="hidden"
                                value={images}
                                key={fields.images.key}
                                name={fields.images.name}
                                defaultValue={fields.images.initialValue as any}
                            />
                            {images.length > 0 ? (
                                <div className="flex gap-5">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative w-[100px] h-[100px]">
                                            <Image
                                                height={100}
                                                width={100}
                                                src={image}
                                                alt="Product Image"
                                                className="w-full h-full object-cover rounded-lg border"
                                            />

                                            <button
                                                onClick={() => handleDelete(index)}
                                                type="button"
                                                className="absolute -top-3 -right-3 bg-red-500 p-2 rounded-lg text-white"
                                            >
                                                <XIcon className="w-3 h-3" />
                                                <span className="sr-only">Delete</span>

                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <UploadDropzone
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => {
                                        setImages(res.map((r) => r.url));
                                    }}
                                    onUploadError={() => {
                                        alert("Something went wrong");
                                    }}
                                />
                            )}

                            <p className="text-red-500">{fields.images.errors}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label>3D Model (AI Generated)</Label>
                            <div className="p-4 border rounded-md bg-muted/50 text-muted-foreground text-sm">
                                3D Model generation will be available after you create the product.
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton text="Create Product" />
                </CardFooter>
            </Card>
        </form>
    );
}
