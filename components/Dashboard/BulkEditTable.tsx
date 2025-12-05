"use client";

import { useState } from "react";
import Link from "next/link";
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
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal, Trash, Save, X, Settings2, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { bulkDeleteProducts, bulkUpdateProducts } from "@/app/store/actions";
import { ProductStatus, MainCategory } from "@prisma/client";

interface Product {
    id: string;
    name: string;
    status: ProductStatus;
    price: number;
    images: string[];
    createdAt: Date;
    mainCategory?: MainCategory | null;
    category?: string | null;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

export function BulkEditTable({ data, categories }: { data: Product[], categories: Category[] }) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editedProducts, setEditedProducts] = useState<Record<string, Partial<Product>>>({});
    const [isPending, setIsPending] = useState(false);

    // Column Visibility State
    const [visibleColumns, setVisibleColumns] = useState({
        image: true,
        name: true,
        status: true,
        price: true,
        date: true,
        actions: true,
    });

    // Bulk Action States
    const [isBulkStatusOpen, setIsBulkStatusOpen] = useState(false);
    const [bulkStatus, setBulkStatus] = useState<ProductStatus | "">("");

    const [isBulkCategoryOpen, setIsBulkCategoryOpen] = useState(false);
    const [bulkMainCategory, setBulkMainCategory] = useState<MainCategory | "">("");
    const [bulkSubCategory, setBulkSubCategory] = useState<string>("");

    const [isBulkPriceOpen, setIsBulkPriceOpen] = useState(false);
    const [bulkPriceAction, setBulkPriceAction] = useState<"increase" | "decrease">("increase");
    const [bulkPricePercentage, setBulkPricePercentage] = useState<number>(0);

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

    const handleBulkStatusUpdate = async () => {
        if (!bulkStatus) return;
        setIsPending(true);
        try {
            const updates = selectedIds.map(id => ({ id, status: bulkStatus as ProductStatus }));
            await bulkUpdateProducts(updates);
            toast.success("Bulk status update successful");
            setIsBulkStatusOpen(false);
            setBulkStatus("");
            setSelectedIds([]);
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setIsPending(false);
        }
    };

    const handleBulkCategoryUpdate = async () => {
        if (!bulkMainCategory && !bulkSubCategory) return;
        setIsPending(true);
        try {
            const updates = selectedIds.map(id => ({
                id,
                ...(bulkMainCategory ? { mainCategory: bulkMainCategory as MainCategory } : {}),
                ...(bulkSubCategory ? { categoryId: bulkSubCategory } : {}), // Assuming backend handles categoryId mapping
            }));
            // Note: The backend action expects 'categoryId' if we are updating the relation. 
            // If 'bulkUpdateProducts' just takes partial Product, we might need to adjust it to handle 'categoryId'.
            // For now assuming standard update.
            await bulkUpdateProducts(updates);
            toast.success("Bulk category update successful");
            setIsBulkCategoryOpen(false);
            setBulkMainCategory("");
            setBulkSubCategory("");
            setSelectedIds([]);
        } catch (error) {
            toast.error("Failed to update category");
        } finally {
            setIsPending(false);
        }
    };

    const handleBulkPriceUpdate = async () => {
        if (bulkPricePercentage <= 0) return;
        setIsPending(true);
        try {
            const updates = selectedIds.map(id => {
                const product = data.find(p => p.id === id);
                if (!product) return { id };

                const currentPrice = product.price;
                const change = currentPrice * (bulkPricePercentage / 100);
                const newPrice = bulkPriceAction === "increase" ? currentPrice + change : currentPrice - change;

                return { id, price: Math.round(newPrice) }; // Round to avoid decimals if needed
            });

            await bulkUpdateProducts(updates);
            toast.success("Bulk price update successful");
            setIsBulkPriceOpen(false);
            setBulkPricePercentage(0);
            setSelectedIds([]);
        } catch (error) {
            toast.error("Failed to update prices");
        } finally {
            setIsPending(false);
        }
    };

    const hasChanges = Object.keys(editedProducts).length > 0;

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border rounded-md border-dashed p-8 text-center animate-in fade-in-50">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MoreHorizontal className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No products found</h3>
                <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                    You haven't created any products yet. Start by adding a new product to your store.
                </p>
                <Button asChild>
                    <Link href="/store/dashboard/products/create">
                        Add Product
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Columns Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-auto">
                                <Settings2 className="mr-2 h-4 w-4" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={visibleColumns.image}
                                onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, image: checked }))}
                            >
                                Image
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={visibleColumns.name}
                                onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, name: checked }))}
                            >
                                Name
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={visibleColumns.status}
                                onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, status: checked }))}
                            >
                                Status
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={visibleColumns.price}
                                onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, price: checked }))}
                            >
                                Price
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={visibleColumns.date}
                                onCheckedChange={(checked) => setVisibleColumns(prev => ({ ...prev, date: checked }))}
                            >
                                Date
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {selectedIds.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Bulk Actions <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => setIsBulkStatusOpen(true)}>
                                    Set Status...
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setIsBulkCategoryOpen(true)}>
                                    Set Category...
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setIsBulkPriceOpen(true)}>
                                    Adjust Price...
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onSelect={handleDelete}
                                >
                                    Delete Selected
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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

            {/* Bulk Status Dialog */}
            <Dialog open={isBulkStatusOpen} onOpenChange={setIsBulkStatusOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Update Status</DialogTitle>
                        <DialogDescription>
                            Update the status for {selectedIds.length} selected products.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>New Status</Label>
                        <Select value={bulkStatus} onValueChange={(v) => setBulkStatus(v as ProductStatus)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkStatusOpen(false)}>Cancel</Button>
                        <Button onClick={handleBulkStatusUpdate} disabled={isPending}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Category Dialog */}
            <Dialog open={isBulkCategoryOpen} onOpenChange={setIsBulkCategoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Update Category</DialogTitle>
                        <DialogDescription>
                            Update categories for {selectedIds.length} selected products.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Main Category</Label>
                            <Select value={bulkMainCategory} onValueChange={(v) => setBulkMainCategory(v as MainCategory)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select main category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MEN">Men</SelectItem>
                                    <SelectItem value="WOMEN">Women</SelectItem>
                                    <SelectItem value="KIDS">Kids</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Sub Category</Label>
                            <Select value={bulkSubCategory} onValueChange={setBulkSubCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select sub category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkCategoryOpen(false)}>Cancel</Button>
                        <Button onClick={handleBulkCategoryUpdate} disabled={isPending}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Price Dialog */}
            <Dialog open={isBulkPriceOpen} onOpenChange={setIsBulkPriceOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Adjust Price</DialogTitle>
                        <DialogDescription>
                            Adjust prices for {selectedIds.length} selected products.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Action</Label>
                            <Select value={bulkPriceAction} onValueChange={(v) => setBulkPriceAction(v as "increase" | "decrease")}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="increase">Increase by %</SelectItem>
                                    <SelectItem value="decrease">Decrease by %</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Percentage</Label>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                value={bulkPricePercentage}
                                onChange={(e) => setBulkPricePercentage(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsBulkPriceOpen(false)}>Cancel</Button>
                        <Button onClick={handleBulkPriceUpdate} disabled={isPending}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                            {visibleColumns.image && <TableHead>Image</TableHead>}
                            {visibleColumns.name && <TableHead>Name</TableHead>}
                            {visibleColumns.status && <TableHead>Status</TableHead>}
                            {visibleColumns.price && <TableHead>Price</TableHead>}
                            {visibleColumns.date && <TableHead>Date</TableHead>}
                            {visibleColumns.actions && <TableHead className="text-end">Actions</TableHead>}
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
                                    {visibleColumns.image && (
                                        <TableCell>
                                            <Image
                                                alt="Product Image"
                                                src={item.images[0]?.trim() || "/placeholder.jpg"}
                                                height={64}
                                                width={64}
                                                className="rounded-md object-cover h-16 w-16"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.name && (
                                        <TableCell>
                                            <Input
                                                value={currentItem.name}
                                                onChange={(e) => handleChange(item.id, "name", e.target.value)}
                                                className="h-8 w-[200px]"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.status && (
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
                                    )}
                                    {visibleColumns.price && (
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={currentItem.price}
                                                onChange={(e) => handleChange(item.id, "price", Number(e.target.value))}
                                                className="h-8 w-[100px]"
                                            />
                                        </TableCell>
                                    )}
                                    {visibleColumns.date && (
                                        <TableCell>
                                            {new Intl.DateTimeFormat("en-US").format(new Date(item.createdAt))}
                                        </TableCell>
                                    )}
                                    {visibleColumns.actions && (
                                        <TableCell className="text-end">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/store/dashboard/products/${item.id}`}>
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/store/dashboard/products/${item.id}/delete`}>
                                                            Delete
                                                        </Link>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
