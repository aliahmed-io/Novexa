"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UploadDropzone } from "@/lib/uploadthing";
import { sendBroadcastEmail } from "@/app/store/dashboard/email/actions";
import { toast } from "sonner";
import { Loader2, Send, X } from "lucide-react";
import Image from "next/image";

export function EmailComposer() {
    const [isLoading, setIsLoading] = useState(false);
    const [audience, setAudience] = useState("all");
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);

        // Append image URL if exists
        if (imageUrl) {
            formData.append("imageUrl", imageUrl);
        }

        // Append audience
        formData.append("audience", audience);

        const result = await sendBroadcastEmail(formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Broadcast sent successfully!");
            // Reset form logic could go here (e.g. via key or ref)
        }
        setIsLoading(false);
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Compose Broadcast</CardTitle>
                <CardDescription>
                    Send announcements, updates, or newsletters to your customers.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>Audience</Label>
                        <Select value={audience} onValueChange={setAudience} name="audience">
                            <SelectTrigger>
                                <SelectValue placeholder="Select audience" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                <SelectItem value="newsletter">Newsletter Subscribers</SelectItem>
                                <SelectItem value="specific">Specific Person (Test)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {audience === "specific" && (
                        <div className="space-y-2">
                            <Label>Recipient Email</Label>
                            <Input
                                name="specificEmail"
                                type="email"
                                placeholder="user@example.com"
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input name="subject" placeholder="Big Sale Announcement!" required />
                    </div>

                    <div className="space-y-2">
                        <Label>Banner Image (Optional)</Label>
                        {imageUrl ? (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                                <Image
                                    src={imageUrl}
                                    alt="Email Banner"
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => setImageUrl(null)}
                                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <UploadDropzone
                                endpoint="imageUploader"
                                onClientUploadComplete={(res) => {
                                    setImageUrl(res[0].url);
                                    toast.success("Image uploaded!");
                                }}
                                onUploadError={(error: Error) => {
                                    toast.error(`Upload failed: ${error.message}`);
                                }}
                                className="ut-label:text-sm ut-allowed-content:text-xs border-dashed border-2 p-4"
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea
                            name="message"
                            placeholder="Write your message here..."
                            className="min-h-[200px]"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Basic text formatting is preserved.
                        </p>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Broadcast
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
