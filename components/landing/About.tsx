import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function About() {
    return (
        <section id="about" className="py-24 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="relative h-[400px] lg:h-[600px] rounded-3xl overflow-hidden group">
                        <Image
                            src="/men.jpeg"
                            alt="About Novexa"
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                    </div>
                    <div className="flex flex-col space-y-6">
                        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium w-fit">
                            Our Story
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Crafting the Future of <span className="text-primary">Style</span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            At Novexa, we believe that headwear is more than just an accessory—it's a statement.
                            Born from a passion for design and a commitment to quality, we've set out to redefine
                            what it means to wear a hat.
                        </p>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Every piece in our collection is meticulously crafted using premium materials and
                            innovative techniques. We blend timeless aesthetics with modern comfort to create
                            products that stand the test of time.
                        </p>
                        <div className="pt-4">
                            <Button asChild size="lg" className="rounded-full px-8">
                                <Link href="/about">Read More About Us</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
