"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/spinner";
import { adminApi } from "@/lib/api";
import { useSession } from "@/lib/auth/use-session";
import { formatDateTime, formatMoney } from "@/lib/utils";
import type { OrderStatus } from "@/lib/api/types";

const STATUSES: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

export default function AdminOrdersPage() {
  const { user, status } = useSession();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const ordersQuery = useQuery({
    queryKey: ["admin", "orders", page],
    queryFn: () => adminApi.adminListOrders(page, 20),
    enabled: status === "authenticated" && user?.role === "ADMIN",
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status: nextStatus }: { id: number; status: OrderStatus }) =>
      adminApi.adminUpdateOrderStatus(id, { status: nextStatus }),
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not update the order."),
  });
  const collectCash = useMutation({
    mutationFn: (id: number) => adminApi.adminCollectCash(id),
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not record cash collection."),
  });
  const refund = useMutation({
    mutationFn: (id: number) => adminApi.adminRefundOrder(id),
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not refund the order."),
  });

  if (status === "idle" || status === "loading" || (status === "authenticated" && !user)) return <PageLoader />;
  if (status === "anonymous") return <AccessNotice message="Sign in with an administrator account to manage orders." />;
  if (user?.role !== "ADMIN") return <AccessNotice message="This area is only available to administrators." />;
  if (ordersQuery.isLoading) return <PageLoader />;
  if (ordersQuery.isError || !ordersQuery.data) {
    return <AccessNotice message="Orders could not be loaded."><Button variant="outline" onClick={() => void ordersQuery.refetch()}>Try again</Button></AccessNotice>;
  }

  const orders = ordersQuery.data.content.filter((order) => {
    const term = search.trim().toLowerCase();
    return !term || order.orderNumber.toLowerCase().includes(term) || (order.shippingAddress?.recipientName ?? "").toLowerCase().includes(term);
  });
  const busy = updateStatus.isPending || collectCash.isPending || refund.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight">Orders</h1><p className="text-muted-foreground mt-2">Review orders and manage their fulfillment.</p></div>
        <Input aria-label="Search orders" className="max-w-sm" placeholder="Search order number or recipient" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      {error ? <p role="alert" className="text-destructive text-sm">{error}</p> : null}
      {orders.length === 0 ? (
        <Card><CardContent className="text-muted-foreground py-10 text-center text-sm">{search ? "No matching orders on this page." : "No orders yet."}</CardContent></Card>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Card key={order.id}><CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-semibold">{order.orderNumber}</p><p className="text-muted-foreground mt-1 text-sm">{order.shippingAddress?.recipientName ?? "Customer"} · {formatDateTime(order.createdAt)}</p></div>
                <div className="flex flex-wrap items-center gap-2"><Badge tone={order.status === "DELIVERED" ? "success" : order.status === "CANCELLED" || order.status === "REFUNDED" ? "warning" : "info"}>{order.status.replaceAll("_", " ")}</Badge><span className="font-semibold">{formatMoney(order.total, order.currency)}</span></div>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <label className="text-muted-foreground text-xs" htmlFor={`status-${order.id}`}>Update status</label>
                <select id={`status-${order.id}`} className="border-border bg-card h-9 rounded-lg border px-2 text-sm" value={order.status} disabled={busy} onChange={(event) => updateStatus.mutate({ id: order.id, status: event.target.value as OrderStatus })}>{STATUSES.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => collectCash.mutate(order.id)}>Record cash collected</Button>
                {order.status !== "REFUNDED" ? <Button size="sm" variant="destructive" disabled={busy} onClick={() => { if (window.confirm(`Refund order ${order.orderNumber}?`)) refund.mutate(order.id); }}>Refund</Button> : null}
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">Page {page + 1} of {Math.max(ordersQuery.data.totalPages, 1)}</p>
        <div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>Previous</Button><Button variant="outline" size="sm" disabled={page + 1 >= ordersQuery.data.totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button><Button variant="ghost" size="icon" aria-label="Refresh orders" onClick={() => void ordersQuery.refetch()}><RefreshCw className="h-4 w-4" aria-hidden /></Button></div>
      </div>
    </div>
  );
}

function AccessNotice({ message, children }: { message: string; children?: React.ReactNode }) {
  return <div className="border-border grid place-items-center gap-3 rounded-xl border border-dashed px-6 py-20 text-center"><CircleAlert className="text-muted-foreground h-8 w-8" aria-hidden /><p className="text-muted-foreground text-sm">{message}</p>{children}</div>;
}
