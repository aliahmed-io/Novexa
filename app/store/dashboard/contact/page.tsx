import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { unstable_noStore as noStore } from "next/cache";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateContactStatus } from "./actions";
import { Check, X, Clock } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MarkAsRead } from "@/components/Dashboard/MarkAsRead";

// Define interface manually to avoid type errors if client isn't regenerated
interface Contact {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: "PENDING" | "COMPLETED" | "IGNORED";
    isRead: boolean;
    createdAt: Date;
}

async function getData(): Promise<Contact[]> {
    const data = await prisma.contact.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    // Custom sort: PENDING -> COMPLETED -> IGNORED
    const statusOrder = {
        PENDING: 0,
        COMPLETED: 1,
        IGNORED: 2,
    };

    data.sort((a, b) => {
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        // If status is same, sort by date (newest first) - already sorted by query but good to be explicit
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return data as unknown as Contact[];
}

export default async function AdminContactPage() {
    noStore();
    const data = await getData();

    return (
        <div className="space-y-4">
            <MarkAsRead />
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Contact Messages</h2>
                    <p className="text-muted-foreground">
                        View and manage customer messages.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>
                        Manage support requests.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead className="w-[40%]">Message</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item) => (
                                <TableRow key={item.id} className={!item.isRead ? "bg-muted/50" : ""}>
                                    <TableCell>
                                        {new Intl.DateTimeFormat("en-US").format(item.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                item.status === "COMPLETED"
                                                    ? "default"
                                                    : item.status === "IGNORED"
                                                        ? "destructive"
                                                        : "secondary"
                                            }
                                        >
                                            {item.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{item.name}</span>
                                            <span className="text-xs text-muted-foreground">{item.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.subject}</TableCell>
                                    <TableCell className="whitespace-pre-wrap">
                                        {item.message}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    Update
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <form action={updateContactStatus.bind(null, item.id, "PENDING")}>
                                                    <button className="w-full text-left">
                                                        <DropdownMenuItem>
                                                            <Clock className="mr-2 h-4 w-4" />
                                                            Mark Pending
                                                        </DropdownMenuItem>
                                                    </button>
                                                </form>
                                                <form action={updateContactStatus.bind(null, item.id, "COMPLETED")}>
                                                    <button className="w-full text-left">
                                                        <DropdownMenuItem>
                                                            <Check className="mr-2 h-4 w-4" />
                                                            Mark Completed
                                                        </DropdownMenuItem>
                                                    </button>
                                                </form>
                                                <form action={updateContactStatus.bind(null, item.id, "IGNORED")}>
                                                    <button className="w-full text-left">
                                                        <DropdownMenuItem>
                                                            <X className="mr-2 h-4 w-4" />
                                                            Mark Ignored
                                                        </DropdownMenuItem>
                                                    </button>
                                                </form>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        No messages found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
