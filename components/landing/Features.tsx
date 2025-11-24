import { ShieldCheck, Zap, Leaf } from "lucide-react";

const features = [
    {
        name: "Premium Materials",
        description: "Crafted from the finest fabrics for durability and comfort that lasts.",
        icon: ShieldCheck,
    },
    {
        name: "Modern Design",
        description: "Sleek, contemporary aesthetics that fit perfectly with any style.",
        icon: Zap,
    },
    {
        name: "Sustainable",
        description: "Eco-friendly production processes that respect the planet.",
        icon: Leaf,
    },
];

export function Features() {
    return (
        <section className="pt-10 pb-24 bg-muted/50">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature) => (
                        <div key={feature.name} className="flex flex-col items-center text-center p-6 bg-background rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                            <div className="p-3 bg-primary/10 rounded-full mb-4 text-primary">
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{feature.name}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
