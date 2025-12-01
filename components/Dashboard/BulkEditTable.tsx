"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash, Save, X } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { bulkDeleteProducts, bulkUpdateProducts } from "@/app/store/actions";

interface Product {
    id: string;
    name: string;
    status: string;
    price: number;
    images: string[];
    createdAt: Date;
}

export function BulkEditTable({ data }: { data: Product[] }) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editedProducts, setEditedProducts] = useState<Record<string, Partial<Product>>>({});
    const [isPending, setIsPending] = useState(false);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(data.map((p) => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter((i) => i !== id));
        }
    };

    const handleChange = (id: string, field: keyof Product, value: any) => {
        setEditedProducts((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: value,
            },
        }));
    };

    const handleSave = async () => {
        setIsPending(true);
        try {
            const updates = Object.entries(editedProducts).map(([id, changes]) => ({
                id,
                ...changes,
            }));
            await bulkUpdateProducts(updates);
            toast.success("Products updated successfully");
            setEditedProducts({});
        } catch (error) {
            toast.error("Failed to update products");
        } finally {
            setIsPending(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete selected products?")) return;
        setIsPending(true);
        try {
            await bulkDeleteProducts(selectedIds);
            toast.success("Products deleted successfully");
            setSelectedIds([]);
        } catch (error) {
            toast.error("Failed to delete products");
        } finally {
            setIsPending(false);
        }
    };

    const hasChanges = Object.keys(editedProducts).length > 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {selectedIds.length > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete ({selectedIds.length})
                        </Button>
                    )}
                </div>
                {hasChanges && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditedProducts({})}
                            disabled={isPending}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isPending}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                )}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedIds.length === data.length && data.length > 0}
                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                />
                            </TableHead>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item) => {
                            const isEdited = !!editedProducts[item.id];
                            const currentItem = { ...item, ...editedProducts[item.id] };

                            return (
                                <TableRow key={item.id} className={isEdited ? "bg-muted/50" : ""}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.includes(item.id)}
                                            onCheckedChange={(checked) => handleSelect(item.id, !!checked)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Image
                                            alt="Product Image"
                                            src={item.images[0]?.trim() || "/placeholder.jpg"}
                                            height={64}
                                            width={64}
                                            className="rounded-md object-cover h-16 w-16"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={currentItem.name}
                                            onChange={(e) => handleChange(item.id, "name", e.target.value)}
                                            className="h-8 w-[200px]"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={currentItem.status}
                                            onValueChange={(value) => handleChange(item.id, "status", value)}
                                        >
                                            <SelectTrigger className="h-8 w-[130px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={currentItem.price}
                                            onChange={(e) => handleChange(item.id, "price", Number(e.target.value))}
                                            className="h-8 w-[100px]"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Intl.DateTimeFormat("en-US").format(new Date(item.createdAt))}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
