import Image from "next/image";
import Link from "next/link";

const items = [
    {
        src: "/all.jpeg",
        alt: "All Collection",
        label: "New Arrivals",
        href: "/store/products/all",
        size: "large", // spans 2 cols
    },
    {
        src: "/women.jpeg",
        alt: "Women's Collection",
        label: "For Her",
        href: "/store/products/women",
        size: "small",
    },
    {
        src: "/men.jpeg",
        alt: "Men's Collection",
        label: "For Him",
        href: "/store/products/men",
        size: "small",
    },
];

export function Showcase() {
    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center mb-12 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Curated Collections</h2>
                    <p className="text-muted-foreground max-w-2xl">
                        Explore our latest releases and find the perfect piece to elevate your look.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
                    {items.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={`relative group overflow-hidden rounded-2xl ${item.size === "large" ? "md:col-span-2 md:row-span-2" : "md:col-span-2 md:row-span-1"
                                }`}
                        >
                            <Image
                                src={item.src}
                                alt={item.alt}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                            <div className="absolute bottom-0 left-0 p-6 md:p-8">
                                <h3 className="text-white text-2xl md:text-3xl font-bold mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    {item.label}
                                </h3>
                                <span className="text-white/80 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 flex items-center gap-2">
                                    Shop Now &rarr;
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
