"use client";

import { useActionState } from "react";
import { createReview } from "@/app/store/actions";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { reviewSchema } from "@/lib/zodSchemas";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useState } from "react";
import { SubmitButton } from "@/components/SubmitButtons";

export function ReviewForm({ productId }: { productId: string }) {
    const [lastResult, action] = useActionState(createReview, undefined);
    const [form, fields] = useForm({
        lastResult,
        onValidate({ formData }) {
            return parseWithZod(formData, { schema: reviewSchema });
        },
        shouldValidate: "onBlur",
        shouldRevalidate: "onInput",
    });

    const [rating, setRating] = useState(0);

    return (
        <form id={form.id} onSubmit={form.onSubmit} action={action} className="flex flex-col gap-4">
            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name={fields.rating.name} value={rating} />

            <div className="flex flex-col gap-2">
                <Label>Rating</Label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`w-6 h-6 cursor-pointer ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                }`}
                            onClick={() => setRating(star)}
                        />
                    ))}
                </div>
                <p className="text-red-500 text-sm">{fields.rating.errors}</p>
            </div>

            <div className="flex flex-col gap-2">
                <Label>Comment</Label>
                <Textarea
                    name={fields.comment.name}
                    key={fields.comment.key}
                    defaultValue={fields.comment.initialValue}
                    placeholder="Write your review here..."
                />
                <p className="text-red-500 text-sm">{fields.comment.errors}</p>
            </div>

            <SubmitButton text="Submit Review" />
        </form>
    );
}
