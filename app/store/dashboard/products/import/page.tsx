"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, Check, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { importProducts } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ImportProductsPage() {
    const [csvData, setCsvData] = useState<any[]>([]);
    const [rawText, setRawText] = useState("");
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setCsvData(results.data);
                    setIsPreviewing(true);
                },
                error: (error) => {
                    toast.error("Error parsing CSV file");
                    console.error(error);
                },
            });
        }
    };

    const handleTextParse = () => {
        if (!rawText.trim()) return;

        Papa.parse(rawText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setCsvData(results.data);
                setIsPreviewing(true);
            },
            error: (error) => {
                toast.error("Error parsing CSV text");
                console.error(error);
            },
        });
    };

    const handleDownloadTemplate = () => {
        const headers = "name,description,status,price,images,category,mainCategory,isFeatured,color,style,height,pattern,tags,features,modelUrl,discountPercentage";
        const blob = new Blob([headers], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "product_import_template.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const handleImport = async () => {
        setIsLoading(true);
        try {
            const result = await importProducts(csvData);
            if (result.success) {
                toast.success(`Successfully imported ${result.count} products`);
                router.push("/store/dashboard/products");
            } else {
                toast.error(result.message || "Failed to import products");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Bulk Import Products</h1>
                    <p className="text-muted-foreground">Import products from CSV file or text</p>
                </div>
                <Button variant="outline" onClick={handleDownloadTemplate}>
                    <FileText className="mr-2 h-4 w-4" /> Download Template
                </Button>
            </div>

            {!isPreviewing ? (
                <div className="grid gap-8 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload CSV File</CardTitle>
                            <CardDescription>Drag and drop or select a CSV file</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 hover:bg-muted/50 transition-colors">
                                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                                <Label htmlFor="file-upload" className="cursor-pointer">
                                    <span className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                                        Select File
                                    </span>
                                    <Input
                                        id="file-upload"
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </Label>
                                <p className="mt-2 text-sm text-muted-foreground">.csv files only</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Paste CSV Text</CardTitle>
                            <CardDescription>Paste your CSV data directly here</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="name,price,description..."
                                className="min-h-[200px] font-mono text-sm"
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                            />
                            <Button onClick={handleTextParse} disabled={!rawText.trim()} className="w-full">
                                <FileText className="mr-2 h-4 w-4" /> Parse Text
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Preview Data</CardTitle>
                            <CardDescription>Review {csvData.length} products before importing</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsPreviewing(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleImport} disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...
                                    </>
                                ) : (
                                    <>
                                        <Check className="mr-2 h-4 w-4" /> Import {csvData.length} Products
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {csvData.length > 0 && Object.keys(csvData[0]).map((header) => (
                                            <TableHead key={header}>{header}</TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {csvData.slice(0, 10).map((row, i) => (
                                        <TableRow key={i}>
                                            {Object.values(row).map((cell: any, j) => (
                                                <TableCell key={j} className="max-w-[200px] truncate">
                                                    {cell}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {csvData.length > 10 && (
                            <p className="text-center text-sm text-muted-foreground mt-4">
                                Showing first 10 of {csvData.length} rows
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
