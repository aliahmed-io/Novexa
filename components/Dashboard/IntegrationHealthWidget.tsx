import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkIntegrations, ServiceStatus } from "@/lib/health";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export async function IntegrationHealthWidget() {
    const healthData = await checkIntegrations();

    return (
        <Card className="mb-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">System Health</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {healthData.map((item) => (
                        <div key={item.service} className="flex flex-col items-center justify-center p-2 border rounded-md bg-muted/20">
                            <StatusIcon status={item.status} />
                            <span className="text-sm font-medium mt-1">{item.service}</span>
                            {item.message && (
                                <span className="text-xs text-muted-foreground text-center">{item.message}</span>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function StatusIcon({ status }: { status: ServiceStatus }) {
    switch (status) {
        case "healthy":
            return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        case "misconfigured":
            return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
        case "unhealthy":
            return <XCircle className="w-5 h-5 text-red-500" />;
    }
}
