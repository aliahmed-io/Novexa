import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SearchProvider } from "@/components/search/SearchContext";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { ShoeAssistant } from "@/components/assistant/ShoeAssistant";

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
        <html lang="en">
            <body className={inter.className}>
                <SearchProvider>
                    {children}
                    <SearchOverlay />
                    <ShoeAssistant />
                </SearchProvider>
            </body>
        </html>
    );
}
