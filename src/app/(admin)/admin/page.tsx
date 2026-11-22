"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CircleAlert, DollarSign, ShoppingBag, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/spinner";
import { adminApi } from "@/lib/api";
import { useSession } from "@/lib/auth/use-session";
import { formatMoney } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { user, status } = useSession();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminApi.getDashboardStats,
    enabled: status === "authenticated" && user?.role === "ADMIN",
  });

  if (status === "idle" || status === "loading" || (status === "authenticated" && !user)) {
    return <PageLoader />;
  }

  if (status === "anonymous") {
    return (
      <Notice title="Sign in required" message="Sign in with an administrator account to access the dashboard.">
        <Link className="text-primary font-medium hover:underline" href="/login?next=/admin">
          Go to sign in
        </Link>
      </Notice>
    );
  }

  if (user?.role !== "ADMIN") {
    return <Notice title="Access denied" message="This area is only available to administrators." />;
  }

  if (isLoading) return <PageLoader />;

  if (isError || !data) {
    return (
      <Notice title="Dashboard unavailable" message="We couldn’t load the latest store statistics.">
        <button className="text-primary font-medium hover:underline" onClick={() => void refetch()}>
          Try again
        </button>
      </Notice>
    );
  }

  const orderCount = Object.values(data.orders).reduce((sum, count) => sum + count, 0);
  const metrics = [
    { label: "Total users", value: data.users.total.toLocaleString(), detail: `${data.users.enabled.toLocaleString()} enabled`, icon: Users },
    { label: "Customers", value: data.users.customers.toLocaleString(), detail: `${data.users.admins.toLocaleString()} administrators`, icon: Users },
    { label: "Orders", value: orderCount.toLocaleString(), detail: "Across all statuses", icon: ShoppingBag },
    { label: "Revenue", value: formatMoney(data.revenue, data.revenueCurrency), detail: "Recorded to date", icon: DollarSign },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store dashboard</h1>
        <p className="text-muted-foreground mt-2">An overview of your store activity.</p>
      </div>

      <section aria-label="Store statistics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-muted-foreground text-sm">{label}</p>
                <CardTitle>{value}</CardTitle>
              </div>
              <Icon className="text-muted-foreground h-5 w-5" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-xs">{detail}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Orders by status</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(data.orders).length === 0 ? (
            <p className="text-muted-foreground text-sm">No order activity yet.</p>
          ) : (
            <ul className="divide-border divide-y">
              {Object.entries(data.orders).sort(([a], [b]) => a.localeCompare(b)).map(([statusName, count]) => (
                <li key={statusName} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="font-medium">{statusName.replaceAll("_", " ")}</span>
                  <span className="text-muted-foreground tabular-nums">{count.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Link href="/orders" className="text-primary inline-flex w-fit items-center gap-2 text-sm font-medium hover:underline">
        View customer orders <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

function Notice({ title, message, children }: { title: string; message: string; children?: React.ReactNode }) {
  return (
    <div className="border-border grid place-items-center gap-3 rounded-xl border border-dashed px-6 py-20 text-center">
      <CircleAlert className="text-muted-foreground h-8 w-8" aria-hidden />
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-muted-foreground text-sm">{message}</p>
      {children}
    </div>
  );
}
