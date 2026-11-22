"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Badge, statusTone } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import { useMyOrders } from "@/features/orders/queries";
import { useSessionStore } from "@/lib/auth/session-store";
import { formatMoney } from "@/lib/utils";

export default function OrdersPage() {
  const status = useSessionStore((s) => s.status);
  const { data, isLoading } = useMyOrders();

  if (status === "anonymous") {
    return (
      <div className="grid place-items-center gap-4 py-24 text-center">
        <Package className="text-muted-foreground h-10 w-10" aria-hidden />
        <p className="text-lg font-semibold">Sign in to see your orders</p>
        <Link href="/login?next=/orders" className="text-primary font-medium hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Your orders</h1>

      {!data || data.content.length === 0 ? (
        <div className="border-border grid place-items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <Package className="text-muted-foreground h-10 w-10" aria-hidden />
          <p className="text-muted-foreground text-sm">No orders yet.</p>
          <Link
            href="/products"
            className="bg-primary text-primary-foreground inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium hover:opacity-90"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.content.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.orderNumber}`}
                className="border-border bg-card hover:shadow-md flex flex-wrap items-center gap-4 rounded-xl border p-4 transition-shadow"
              >
                <div className="min-w-40 flex-1">
                  <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
                  <p className="text-muted-foreground text-xs">
                    {order.items.length} {order.items.length === 1 ? "item" : "items"} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                <span className="font-semibold">
                  {formatMoney(order.total, order.currency)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
