
import { type ReactNode } from "react";
import { Metadata } from "next";
import { Footer } from "@/components/storefront/Footer";

export const metadata: Metadata = {
    title: "Novexa - Premium Headwear",
    description: "Experience the perfect blend of style, comfort, and innovation with Novexa.",
};


export default function LandingPageLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <>

            <main className="min-h-screen">{children}</main>
            <Footer />
        </>
    );
}
