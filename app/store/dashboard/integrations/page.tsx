
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllHealth, ServiceHealth } from "@/lib/integrations/health";
import { CheckCircle2, XCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

async function refreshHealth() {
    "use server";
    revalidatePath("/store/dashboard/integrations");
}

export default async function IntegrationsPage() {
    const healthData = await getAllHealth();

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
                    <p className="text-muted-foreground mt-2">Status of third-party integrations and services.</p>
                </div>
                <form action={refreshHealth}>
                    <Button variant="outline">Refresh Status</Button>
                </form>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {healthData.map((service) => (
                    <HealthCard key={service.name} service={service} />
                ))}
            </div>
        </section>
    );
}

function HealthCard({ service }: { service: ServiceHealth }) {
    let icon = <CheckCircle2 className="h-6 w-6 text-green-500" />;
    let statusColor = "bg-green-100 text-green-800";
    let borderColor = "border-l-4 border-l-green-500";

    if (service.status === "down") {
        icon = <XCircle className="h-6 w-6 text-red-500" />;
        statusColor = "bg-red-100 text-red-800";
        borderColor = "border-l-4 border-l-red-500";
    } else if (service.status === "degraded") {
        icon = <AlertTriangle className="h-6 w-6 text-yellow-500" />;
        statusColor = "bg-yellow-100 text-yellow-800";
        borderColor = "border-l-4 border-l-yellow-500";
    } else if (service.status === "misconfigured") {
        icon = <AlertCircle className="h-6 w-6 text-orange-500" />;
        statusColor = "bg-orange-100 text-orange-800";
        borderColor = "border-l-4 border-l-orange-500";
    }

    return (
        <Card className={`${borderColor} shadow-sm overflow-hidden`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/20">
                <CardTitle className="text-sm font-medium">
                    {service.name}
                </CardTitle>
                {icon}
            </CardHeader>
            <CardContent className="pt-4">
                <div className="flex justify-between items-center mb-2">
                    <Badge variant="secondary" className={statusColor}>
                        {service.status.toUpperCase()}
                    </Badge>
                    {service.latency && (
                        <span className="text-xs text-muted-foreground">{service.latency}ms</span>
                    )}
                </div>
                {service.message && (
                    <p className="text-sm text-muted-foreground truncate" title={service.message}>
                        {service.message}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
