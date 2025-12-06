
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy - Novexa",
    description: "Privacy Policy for Novexa e-commerce platform.",
};

export default function PrivacyPage() {
    return (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

            <div className="prose prose-stone dark:prose-invert max-w-none space-y-6">
                <p>Last updated: December 6, 2024</p>

                <section>
                    <h2 className="text-xl font-semibold mb-4">1. Information Collection</h2>
                    <p>
                        We collect information from you when you register on our site, place an order, subscribe to our newsletter, or fill out a form.
                        When ordering or registering on our site, as appropriate, you may be asked to enter your: name, e-mail address, mailing address, or phone number.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">2. Information Usage</h2>
                    <p>
                        Any of the information we collect from you may be used in one of the following ways:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>To personalize your experience</li>
                        <li>To improve our website</li>
                        <li>To improve customer service</li>
                        <li>To process transactions</li>
                        <li>To send periodic emails</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">3. Information Protection</h2>
                    <p>
                        We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
                        We use a secure server. All supplied sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our Payment gateway providers database.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">4. Cookie Usage</h2>
                    <p>
                        Yes. Cookies are small files that a site or its service provider transfers to your computers hard drive through your Web browser (if you allow)
                        that enables the sites or service providers systems to recognize your browser and capture and remember certain information.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">5. Third Party Disclosure</h2>
                    <p>
                        We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information.
                        This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you,
                        so long as those parties agree to keep this information confidential.
                    </p>
                </section>
            </div>
        </section>
    );
}
