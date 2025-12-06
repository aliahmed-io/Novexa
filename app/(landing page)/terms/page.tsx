
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service - Novexa",
    description: "Terms of Service for Novexa e-commerce platform.",
};

export default function TermsPage() {
    return (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

            <div className="prose prose-stone dark:prose-invert max-w-none space-y-6">
                <p>Last updated: December 6, 2024</p>

                <section>
                    <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
                        In addition, when using this websites particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
                    <p>
                        Novexa provides an online platform for purchasing premium headwear and related accessories.
                        You are responsible for obtaining access to the Service and that access may involve third party fees (such as Internet service provider or airtime charges).
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">3. Registration</h2>
                    <p>
                        You agree to: (a) provide true, accurate, current and complete information about yourself as prompted by the Service's registration form and
                        (b) maintain and promptly update the Registration Data to keep it true, accurate, current and complete.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">4. Product Descriptions</h2>
                    <p>
                        Novexa attempts to be as accurate as possible. However, we do not warrant that product descriptions or other content of this site is accurate,
                        complete, reliable, current, or error-free. If a product offered by us itself is not as described, your sole remedy is to return it in unused condition.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">5. Pricing</h2>
                    <p>
                        Except where noted otherwise, the List Price displayed for products on our website represents the full retail price listed on the product itself.
                        We cannot confirm the price of an item until you order.
                    </p>
                </section>
            </div>
        </section>
    );
}
