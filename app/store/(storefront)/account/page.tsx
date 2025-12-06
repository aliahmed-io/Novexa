
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import prisma from "@/lib/db";
import { AddressForm } from "./AddressForm"; // We will create this
import { AddressList } from "./AddressList"; // We will create this

async function getUserData(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            addresses: true,
        },
    });
    return user;
}

export default async function AccountPage() {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
        return redirect("/api/auth/login");
    }

    const dbUser = await getUserData(user.id);

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="addresses">Addresses</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                View your profile details from Kinde.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={user.picture || ""} />
                                    <AvatarFallback>{user.given_name?.[0]}{user.family_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-medium">{user.given_name} {user.family_name}</h3>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input disabled value={user.given_name || ""} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input disabled value={user.family_name || ""} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Email</Label>
                                    <Input disabled value={user.email || ""} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="addresses">
                    <Card>
                        <CardHeader>
                            <CardTitle>Adresses</CardTitle>
                            <CardDescription>
                                Manage your shipping addresses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AddressList addresses={dbUser?.addresses || []} userId={user.id} />
                            <div className="mt-8">
                                <h3 className="text-lg font-medium mb-4">Add New Address</h3>
                                <AddressForm userId={user.id} />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
