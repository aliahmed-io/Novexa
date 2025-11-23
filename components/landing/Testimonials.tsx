import { Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
    {
        name: "Alex Johnson",
        role: "Fashion Enthusiast",
        content: "The quality of these hats is unmatched. I've never felt more confident in my style.",
        avatar: "/men.jpeg", // Using existing image as placeholder
    },
    {
        name: "Sarah Williams",
        role: "Designer",
        content: "Absolutely love the attention to detail. A must-have for anyone who appreciates good design.",
        avatar: "/women.jpeg", // Using existing image as placeholder
    },
    {
        name: "Michael Chen",
        role: "Verified Buyer",
        content: "Fast shipping and excellent customer service. The product exceeded my expectations.",
        avatar: "/all.jpeg", // Using existing image as placeholder
    },
];

export function Testimonials() {
    return (
        <section className="py-24">
            <div className="container mx-auto px-4 md:px-6">
                <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="flex flex-col p-6 bg-card rounded-2xl border">
                            <div className="flex items-center gap-1 mb-4 text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <p className="text-muted-foreground mb-6 flex-grow">"{testimonial.content}"</p>
                            <div className="flex items-center gap-4">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                    <Image
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">{testimonial.name}</h4>
                                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
