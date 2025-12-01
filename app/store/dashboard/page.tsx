import { Chart } from "@/components/Dashboard/Charts";
import { DashboardStats } from "@/components/Dashboard/DashboardStats";
import { RecentSales } from "@/components/Dashboard/RecentSales";
import { AiInsightsWidget } from "@/components/Dashboard/AiInsightsWidget";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/db";

import { unstable_noStore as noStore } from "next/cache";


return result;
}

export default async function Dashboard() {
  noStore();
  const data = await getData();
  return (
    <>
      <AiInsightsWidget />
      <DashboardStats />

      <div className="grid gap-4 md:gp-8 lg:grid-cols-2 xl:grid-cols-3 mt-10">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              Recent transactions from the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Chart data={data} />
          </CardContent>
        </Card>

        <RecentSales />
      </div>
    </>
  );
}