"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, XIcon } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { categorySchema } from "@/lib/zodSchemas";
import { editCategory } from "../actions";
import { SubmitButton } from "@/components/Dashboard/SubmitButtons";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";

interface iAppProps {
    data: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        image: string | null;
    };
}

export function EditCategoryForm({ data }: iAppProps) {
    const [image, setImage] = useState<string | undefined>(data.image || undefined);
    const [lastResult, action] = useActionState(editCategory, undefined);
    const [form, fields] = useForm({
        lastResult,
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: categorySchema });
        },
        shouldValidate: "onBlur",
        shouldRevalidate: "onInput",
    });

    return (
        <form id={form.id} onSubmit={form.onSubmit} action={action}>
            <input type="hidden" name="categoryId" value={data.id} />
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/store/dashboard/categories">
                        <ChevronLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold tracking-tight">Edit Category</h1>
            </div>

            <Card className="mt-5">
                <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                    <CardDescription>
                        Update your category details
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <Label>Name</Label>
                            <Input
                                key={fields.name.key}
                                name={fields.name.name}
                                defaultValue={data.name}
                                placeholder="Category Name"
                            />
                            <p className="text-red-500">{fields.name.errors}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label>Slug</Label>
                            <Input
                                key={fields.slug.key}
                                name={fields.slug.name}
                                defaultValue={data.slug}
                                placeholder="Category Slug"
                            />
                            <p className="text-red-500">{fields.slug.errors}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label>Description</Label>
                            <Textarea
                                key={fields.description.key}
                                name={fields.description.name}
                                defaultValue={data.description || ""}
                                placeholder="Category Description"
                            />
                            <p className="text-red-500">{fields.description.errors}</p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Label>Image</Label>
                            <input
                                type="hidden"
                                name={fields.image.name}
                                key={fields.image.key}
                                value={image}
                                defaultValue={fields.image.initialValue as any}
                            />
                            {image ? (
                                <div className="relative w-[200px] h-[200px]">
                                    <Image
                                        src={image}
                                        alt="Category Image"
                                        className="w-full h-full object-cover rounded-lg"
                                        width={200}
                                        height={200}
                                    />
                                    <button
                                        onClick={() => setImage(undefined)}
                                        type="button"
                                        className="absolute -top-3 -right-3 bg-red-500 p-2 rounded-lg text-white"
                                    >
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <UploadDropzone
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => {
                                        setImage(res[0].url);
                                    }}
                                    onUploadError={() => {
                                        alert("Something went wrong");
                                    }}
                                />
                            )}
                            <p className="text-red-500">{fields.image.errors}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton text="Edit Category" />
                </CardFooter>
            </Card>
        </form>
    );
}
