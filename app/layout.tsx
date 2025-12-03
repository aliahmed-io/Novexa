import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SearchProvider } from "@/components/search/SearchContext";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Novexa",
    description: "Novexa Application",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <SearchProvider>
                    {children}
                    <SearchOverlay />
                    <Toaster richColors closeButton />
                </SearchProvider>
            </body>
        </html>
    );
}
