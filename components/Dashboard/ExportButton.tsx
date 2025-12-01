"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Papa from "papaparse";
import { exportProducts } from "@/app/store/dashboard/products/export/actions";

export function ExportButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const result = await exportProducts();

            if (!result.success || !result.data) {
                toast.error(result.message || "Failed to fetch products");
                return;
            }

            const csv = Papa.unparse(result.data);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Exported ${result.data.length} products`);
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export products");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button variant="outline" onClick={handleExport} disabled={isLoading} className="flex items-center gap-x-2">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Export CSV</span>
        </Button>
    );
}
