import { LandingHero } from "@/components/landing/LandingHero";
import { Features } from "@/components/landing/Features";
import { Showcase } from "@/components/landing/Showcase";
import { About } from "@/components/landing/About";
import { Testimonials } from "@/components/landing/Testimonials";
import { Newsletter } from "@/components/landing/Newsletter";

export default function LandingPage() {
    return (
        <>
            <LandingHero />
            <Features />
            <Showcase />
            <About />
            <Testimonials />
            <Newsletter />
        </>
    );
}
