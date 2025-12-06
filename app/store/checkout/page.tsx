import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { ShippingForm } from "./ShippingForm";

export default async function CheckoutPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return redirect("/store/api/auth/login");
  }
  const initialAddress = await prisma.address.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Shipping details</h1>
        <p className="text-muted-foreground text-sm">
          Enter your shipping information below. You&apos;ll be redirected to secure payment
          after confirming your address.
        </p>
      </div>

      <ShippingForm initialAddress={initialAddress || undefined} />
    </section>
  );
}
