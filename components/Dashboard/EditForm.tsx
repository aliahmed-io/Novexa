"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, XIcon } from "lucide-react";
import Link from "next/link";
import { SubmitButton } from "../SubmitButtons";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";

import { useActionState, useState, useTransition } from "react";
import { editProduct, generate3DModel, delete3DModel } from "@/app/store/actions";

import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { type $Enums } from "@prisma/client";
import { productSchema } from "@/lib/zodSchemas";
import { categories } from "@/lib/Categories";
import { UploadDropzone } from "@/lib/uploadthing";
import { Button } from "../ui/button";

interface iAppProps {
  data: {
    id: string;
    name: string;
    description: string;
    status: $Enums.ProductStatus;
    price: number;
    images: string[];
    category: $Enums.Category;
    isFeatured: boolean;
    discountPercentage: number;
    modelUrl: string | null;
    meshyStatus: string | null;
    meshyProgress: number | null;
  };
}

export function EditForm({ data }: iAppProps) {
  const [images, setImages] = useState<string[]>(data.images);
  const [lastResult, action] = useActionState(editProduct, undefined);
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
  return (
    <form id={form.id} onSubmit={form.onSubmit} action={action}>
      <input type="hidden" name="productId" value={data.id} />
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/store/dashboard/products">
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Edit Product</h1>
      </div>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>
            In this form you can update your product
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
                defaultValue={data.name}
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
                defaultValue={data.description}
                placeholder="Write your description right here..."
              />
              <p className="text-red-500">{fields.description.errors}</p>
            </div>
            <div className="flex flex-col gap-3">
              <Label>Price</Label>
              <Input
                key={fields.price.key}
                name={fields.price.name}
                defaultValue={data.price}
                type="number"
                placeholder="$55"
              />
              <p className="text-red-500">{fields.price.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Discount Percentage</Label>
              <Input
                key={fields.discountPercentage.key}
                name={fields.discountPercentage.name}
                defaultValue={data.discountPercentage}
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
                defaultChecked={data.isFeatured}
              />
              <p className="text-red-500">{fields.isFeatured.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Status</Label>
              <Select
                key={fields.status.key}
                name={fields.status.name}
                defaultValue={data.status}
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
              <Label>Category</Label>
              <Select
                key={fields.category.key}
                name={fields.category.name}
                defaultValue={data.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-red-500">{fields.category.errors}</p>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Images</Label>
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
              <Label>3D Model</Label>
              <ModelSwitch
                productId={data.id}
                imageUrl={images[0]}
                hasModel={!!data.modelUrl}
                status={data.meshyStatus}
                progress={data.meshyProgress}
                modelUrl={data.modelUrl}
              />
            </div>

          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton text="Edit Product" />
        </CardFooter>
      </Card>
    </form>
  );
}

function ModelSwitch({
  productId,
  imageUrl,
  hasModel,
  status,
  progress,
  modelUrl
}: {
  productId: string,
  imageUrl: string,
  hasModel: boolean,
  status: string | null,
  progress: number | null,
  modelUrl: string | null
}) {
  const [isPending, startTransition] = useTransition();
  const isGenerating = status === "PENDING" || status === "IN_PROGRESS";

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      if (checked) {
        const res = await generate3DModel(productId, imageUrl);
        if (!res.success) alert("Failed to start generation");
      } else {
        if (confirm("Are you sure you want to delete this 3D model?")) {
          await delete3DModel(productId);
        }
      }
    });
  };

  const handleRegenerate = () => {
    if (confirm("This will delete the current model and generate a new one. Continue?")) {
      startTransition(async () => {
        await generate3DModel(productId, imageUrl);
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-4">
        <Switch
          checked={hasModel || isGenerating}
          disabled={isPending || !imageUrl}
          onCheckedChange={handleToggle}
        />
        <span className="text-sm font-medium">
          {hasModel ? "3D Model Enabled" : isGenerating ? "Generating..." : "Enable 3D Model"}
        </span>
      </div>

      {isGenerating && (
        <div className="text-xs text-muted-foreground ml-14">
          Status: {status} {progress ? `(${progress}%)` : ""}
        </div>
      )}

      {hasModel && (
        <div className="flex items-center gap-2 ml-14">
          <Button variant="outline" size="sm" asChild>
            <a href={modelUrl!} target="_blank" rel="noopener noreferrer">View</a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            disabled={isPending}
            className="text-muted-foreground hover:text-foreground"
          >
            Regenerate
          </Button>
        </div>
      )}

      {status === "FAILED" && !hasModel && !isGenerating && (
        <div className="text-xs text-red-500 ml-14">
          Generation failed. Toggle off and on to try again.
        </div>
      )}
    </div>
  );
}