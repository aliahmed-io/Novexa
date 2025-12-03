"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { NavbarLinks } from "./NavbarLinks";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";

import { usePathname } from "next/navigation";

export function MobileMenu({ user }: { user: any }) {
    const pathname = usePathname();
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                    <MenuIcon className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <nav className="flex flex-col gap-6 mt-6">
                    <NavbarLinks />
                    {!user && (
                        <div className="flex flex-col gap-2 mt-4">
                            <Button variant="ghost" asChild className="justify-start">
                                <LoginLink postLoginRedirectURL={pathname}>Sign in</LoginLink>
                            </Button>
                            <Button variant="ghost" asChild className="justify-start">
                                <RegisterLink postLoginRedirectURL={pathname}>
                                    Create Account
                                </RegisterLink>
                            </Button>
                        </div>
                    )}
                </nav>
            </SheetContent>
        </Sheet>
    );
}
