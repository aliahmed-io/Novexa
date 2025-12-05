import { EmailComposer } from "@/components/Dashboard/EmailComposer";
import prisma from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";

async function getUsers() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return users;
}

export default async function EmailPage() {
    noStore();
    const users = await getUsers();
    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Email Broadcasting</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your email campaigns and announcements.
                </p>
            </div>

            <EmailComposer users={users} />
        </div>
    );
}
