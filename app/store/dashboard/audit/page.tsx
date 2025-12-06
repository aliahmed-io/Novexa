
import prisma from "@/lib/db";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

async function getAuditLogs() {
    const data = await prisma.auditLog.findMany({
        take: 50,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            user: {
                select: {
                    email: true,
                    firstName: true,
                    lastName: true,
                }
            }
        }
    });
    return data;
}

export default async function AuditLogPage() {
    const logs = await getAuditLogs();

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground mt-2">Recent critical system actions.</p>
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Details</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    No audit logs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium whitespace-nowrap">
                                        {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{log.user?.firstName} {log.user?.lastName}</span>
                                            <span className="text-xs text-muted-foreground">{log.user?.email || "System"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getActionColor(log.action)}>
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{log.targetType}</Badge>
                                            <span className="text-xs text-muted-foreground font-mono">{log.targetId?.slice(0, 8)}...</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground font-mono" title={JSON.stringify(log.metadata)}>
                                        {log.metadata ? JSON.stringify(log.metadata) : "-"}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </section>
    );
}

function getActionColor(action: string) {
    switch (action) {
        case "DELETE":
        case "REFUND":
            return "bg-red-100 text-red-800 border-red-200";
        case "CREATE":
        case "PUBLISH":
            return "bg-green-100 text-green-800 border-green-200";
        case "UPDATE":
            return "bg-blue-100 text-blue-800 border-blue-200";
        default:
            return "bg-gray-100 text-gray-800 border-gray-200";
    }
}
