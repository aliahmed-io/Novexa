import { CheckoutButton, DeleteItem } from "@/components/SubmitButtons";
import { Cart } from "@/lib/interfaces";
import { redis } from "@/lib/redis";
import { Button } from "@/components/ui/button";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { redirect } from "next/navigation";
import { delItem } from "@/app/store/actions";
import { DiscountForm, RemoveDiscountButton } from "@/components/storefront/DiscountForm";

export default async function BagRoute() {
  noStore();
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/store/shop");
  }

  let cart: Cart | null = null;
  if (redis) {
    try {
      cart = (await redis.get<Cart>(`cart-${user.id}`)) as Cart | null;
    } catch {
      cart = null;
    }
  }

  let totalPrice = 0;

  cart?.items.forEach((item) => {
    totalPrice += item.price * item.quantity;
  });

  return (
    <div className="max-w-2xl mx-auto mt-10 min-h-[55vh]">
      {!cart || !cart.items || cart.items.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center mt-20">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <ShoppingBag className="w-10 h-10 text-primary" />
          </div>

          <h2 className="mt-6 text-xl font-semibold">
            You dont have any products in your Bag
          </h2>
          <p className="mb-8 mt-2 text-center text-sm leading-6 text-muted-foreground max-w-sm mx-auto">
            You currently dont have any products in your shopping bag. Please
            add some so that you can see them right here.
          </p>

          <Button asChild>
            <Link href="/store/shop">Shop Now!</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-y-10">
          {cart?.items.map((item) => (
            <div key={item.id} className="flex">
              <div className="w-24 h-24 sm:w-32 sm:h-32 relative">
                <Image
                  className="rounded-md object-cover"
                  fill
                  src={item.imageString}
                  alt="Product image"
                />
              </div>
              <div className="ml-5 flex justify-between w-full font-medium">
                <p>{item.name}</p>
                <div className="flex flex-col h-full justify-between">
                  <div className="flex items-center gap-x-2">
                    <p>{item.quantity} x</p>
                    <p>${item.price}</p>
                  </div>

                  <form action={delItem} className="text-end">
                    <input type="hidden" name="productId" value={item.id} />
                    <DeleteItem />
                  </form>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-10">
            <div className="flex items-center justify-between font-medium">
              <p>Subtotal:</p>
              <p>${new Intl.NumberFormat("en-US").format(totalPrice)}</p>
            </div>

            {cart.discountCode && cart.discountPercentage ? (
              <div className="flex items-center justify-between font-medium text-green-600 mt-2">
                <div className="flex items-center gap-2">
                  <p>Discount ({cart.discountCode} - {cart.discountPercentage}%):</p>
                  <RemoveDiscountButton />
                </div>
                <p>-${new Intl.NumberFormat("en-US").format(totalPrice * (cart.discountPercentage / 100))}</p>
              </div>
            ) : (
              <div className="mt-4">
                <DiscountForm />
              </div>
            )}

            <div className="flex items-center justify-between font-bold text-xl mt-4 border-t pt-4">
              <p>Total:</p>
              <p>${new Intl.NumberFormat("en-US").format(
                cart.discountPercentage
                  ? totalPrice * (1 - cart.discountPercentage / 100)
                  : totalPrice
              )}</p>
            </div>

            <CheckoutButton />
          </div>
        </div>
      )}
    </div>
  );
}