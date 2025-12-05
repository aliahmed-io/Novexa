"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Dashboard",
    href: "/store/dashboard",
  },
  {
    name: "Orders",
    href: "/store/dashboard/orders",
  },
  {
    name: "Products",
    href: "/store/dashboard/products",
  },
  {
    name: "Categories",
    href: "/store/dashboard/categories",
  },
  {
    name: "Banner Picture",
    href: "/store/dashboard/banner",
  },
  {
    name: "Email",
    href: "/store/dashboard/email",
  },
  {
    name: "Contact",
    href: "/store/dashboard/contact",
  },
];

interface DashboardNavigationProps {
  pendingContactCount?: number;
}

export function DashboardNavigation({ pendingContactCount = 0 }: DashboardNavigationProps) {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            link.href === pathname
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
            "flex items-center gap-2"
          )}
        >
          {link.name}
          {link.name === "Contact" && pendingContactCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {pendingContactCount}
            </span>
          )}
        </Link>
      ))}
    </>
  );
}
