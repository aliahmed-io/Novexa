"use client";

import { Button } from "@/components/ui/button";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { usePathname } from "next/navigation";

export function AuthButtons() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-end md:space-x-2">
            <Button variant="ghost" asChild>
                <LoginLink postLoginRedirectURL={pathname}>Sign in</LoginLink>
            </Button>
            <span className="h-6 w-px bg-gray-200"></span>
            <Button variant="ghost" asChild>
                <RegisterLink postLoginRedirectURL={pathname}>Create Account</RegisterLink>
            </Button>
        </div>
    );
}
