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
import { Loader2, Send, X, Check, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

interface EmailComposerProps {
    users: User[];
}

export function EmailComposer({ users }: EmailComposerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [audience, setAudience] = useState("all");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [open, setOpen] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);

        // Append image URL if exists
        if (imageUrl) {
            formData.append("imageUrl", imageUrl);
        }

        // Append audience
        formData.append("audience", audience);

        // Append specific emails if audience is specific
        if (audience === "specific") {
            if (selectedEmails.length === 0) {
                toast.error("Please select at least one recipient");
                setIsLoading(false);
                return;
            }
            formData.append("specificEmails", JSON.stringify(selectedEmails));
        }

        const result = await sendBroadcastEmail(formData);

        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Broadcast sent successfully!");
            // Reset form logic
            setAudience("all");
            setImageUrl(null);
            setSelectedEmails([]);
        }
        setIsLoading(false);
    }

    const toggleUser = (email: string) => {
        setSelectedEmails(current =>
            current.includes(email)
                ? current.filter(e => e !== email)
                : [...current, email]
        );
    };

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
                                <SelectItem value="specific">Specific People</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {audience === "specific" && (
                        <div className="space-y-2">
                            <Label>Recipients</Label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between h-auto min-h-[40px]"
                                    >
                                        {selectedEmails.length > 0
                                            ? `${selectedEmails.length} selected`
                                            : "Select users..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search users..." />
                                        <CommandList>
                                            <CommandEmpty>No user found.</CommandEmpty>
                                            <CommandGroup className="max-h-[200px] overflow-auto">
                                                {users.map((user) => (
                                                    <CommandItem
                                                        key={user.id}
                                                        value={`${user.firstName} ${user.lastName} ${user.email}`}
                                                        onSelect={() => toggleUser(user.email)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedEmails.includes(user.email)
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span>{user.firstName} {user.lastName}</span>
                                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            {selectedEmails.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {selectedEmails.map(email => (
                                        <Badge key={email} variant="secondary" className="flex items-center gap-1">
                                            {email}
                                            <button
                                                type="button"
                                                onClick={() => toggleUser(email)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
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
