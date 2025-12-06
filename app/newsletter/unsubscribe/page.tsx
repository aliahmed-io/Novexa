import prisma from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email;
  let success = false;

  if (email) {
    try {
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { status: "unsubscribed" },
      });
      success = true;
    } catch {
      success = false;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>{success ? "You have been unsubscribed" : "Unable to unsubscribe"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          {success ? (
            <p>
              {email
                ? `The email address ${email} has been removed from our marketing list.`
                : "Your email has been removed from our marketing list."}
            </p>
          ) : (
            <p>
              We could not process your unsubscribe request. The link may be invalid or expired.
            </p>
          )}
          <Button asChild className="mt-2">
            <Link href="/store/shop">Back to store</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
