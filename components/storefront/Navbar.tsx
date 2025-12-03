import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ShoppingBagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthButtons } from "./AuthButtons";
import { NavbarLinks } from "./NavbarLinks";
import { UserDropdown } from "./UserDropdown";
import Image from "next/image";
import { redis } from "@/lib/redis";
import { Cart } from "@/lib/interfaces";
import { NavbarSearchTrigger } from "@/components/search/NavbarSearchTrigger";
import { MobileMenu } from "./MobileMenu";

export async function Navbar() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  let cart: Cart | null = null;
  if (user?.id && redis) {
    try {
      cart = (await redis.get<Cart>(`cart-${user.id}`)) as Cart | null;
    } catch {
      cart = null;
    }
  }

  const total = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
      <div className="flex items-center">
        <MobileMenu user={user} />

        <Link href="/store/shop">
          <Image
            src="/logo.svg"
            alt="Site Logo"
            height={120}
            width={120}
            style={{ width: "auto", height: "auto" }}
          />
        </Link>
        <div className="hidden md:flex ml-8">
          <NavbarLinks />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NavbarSearchTrigger />
        {user ? (
          <>
            <Link href="/store/bag" className="group p-2 flex items-center mr-2">
              <ShoppingBagIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-500" />
              <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
                {total}
              </span>
            </Link>

            <UserDropdown
              email={user.email as string}
              name={user.given_name as string}
              userImage={
                user.picture ?? `https://avatar.vercel.sh/${user.given_name}`
              }
            />
          </>
        ) : (
          <AuthButtons />
        )}
      </div>
    </nav>
  );
}
