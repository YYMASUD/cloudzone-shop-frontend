"use client";

import Link from "next/link";
import { use, useState } from "react";
import { CheckCircle2, CreditCard, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, statusTone } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import { useCancelOrder, useOrder, usePayOrder } from "@/features/orders/queries";
import { formatDateTime, formatMoney } from "@/lib/utils";
import type { OrderAddressResponse } from "@/lib/api/types";

function addressLine(address: OrderAddressResponse | null) {
  if (!address) return "—";
  return [
    address.recipientName,
    address.line1,
    address.line2,
    `${address.city}${address.postalCode ? ` ${address.postalCode}` : ""}`,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const { data: order, isLoading, error } = useOrder(orderNumber);
  const pay = usePayOrder(orderNumber);
  const cancel = useCancelOrder(orderNumber);
  const [message, setMessage] = useState<string | null>(null);

  if (isLoading) return <PageLoader />;

  if (error || !order) {
    return (
      <div className="grid place-items-center gap-3 py-24 text-center">
        <p className="text-lg font-semibold">Order not found</p>
        <Link href="/orders" className="text-primary text-sm font-medium hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const payable = order.status === "PENDING";
  const cancellable = ["PENDING", "PAID", "PROCESSING"].includes(order.status);
  const paid = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/orders" className="text-muted-foreground text-sm hover:underline">
            ← Orders
          </Link>
          <h1 className="font-mono text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
          <p className="text-muted-foreground text-sm">
            Placed {formatDateTime(order.createdAt)}
          </p>
        </div>
        <Badge tone={statusTone(order.status)}>{order.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <section className="border-border bg-card rounded-xl border">
            <h2 className="border-border border-b p-4 font-semibold">Items</h2>
            <ul className="divide-border divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="text-sm font-medium">{item.productName}</p>
                    <p className="text-muted-foreground font-mono text-xs">{item.productSku}</p>
                  </div>
                  <span className="text-sm">
                    {item.quantity} × {formatMoney(item.unitPrice, order.currency)}
                  </span>
                  <span className="w-24 text-right font-medium">
                    {formatMoney(item.lineTotal, order.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="border-border bg-card rounded-xl border p-4">
              <h3 className="text-sm font-semibold">Shipping to</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {addressLine(order.shippingAddress)}
              </p>
            </section>
            <section className="border-border bg-card rounded-xl border p-4">
              <h3 className="text-sm font-semibold">Billing</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                {addressLine(order.billingAddress ?? order.shippingAddress)}
              </p>
            </section>
          </div>

          {order.notes ? (
            <section className="border-border bg-card rounded-xl border p-4">
              <h3 className="text-sm font-semibold">Notes</h3>
              <p className="text-muted-foreground mt-1 text-sm">{order.notes}</p>
            </section>
          ) : null}
        </div>

        <aside className="border-border bg-card h-fit rounded-xl border p-5">
          <h2 className="font-semibold">Summary</h2>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatMoney(order.subtotal, order.currency)}</dd>
            </div>
            {order.discountAmount > 0 ? (
              <div className="flex justify-between text-emerald-600">
                <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                <dd>−{formatMoney(order.discountAmount, order.currency)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{formatMoney(order.shippingCost, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd>{formatMoney(order.tax, order.currency)}</dd>
            </div>
            <div className="border-border flex justify-between border-t pt-2 text-base font-bold">
              <dt>Total</dt>
              <dd>{formatMoney(order.total, order.currency)}</dd>
            </div>
          </dl>

          {paid ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Payment received
            </p>
          ) : null}

          {message ? <p className="text-muted-foreground mt-3 text-sm">{message}</p> : null}

          <div className="mt-4 flex flex-col gap-2">
            {payable ? (
              <Button
                size="lg"
                disabled={pay.isPending}
                onClick={() =>
                  pay.mutate(undefined, {
                    onSuccess: (payment) =>
                      setMessage(
                        payment.status === "SUCCEEDED"
                          ? "Payment captured."
                          : `Payment ${payment.status.toLowerCase()}.`,
                      ),
                    onError: (err) =>
                      setMessage(err instanceof Error ? err.message : "Payment failed"),
                  })
                }
              >
                <CreditCard className="h-4 w-4" aria-hidden />
                {pay.isPending ? "Processing…" : "Pay now"}
              </Button>
            ) : null}
            {cancellable ? (
              <Button
                variant="outline"
                disabled={cancel.isPending}
                onClick={() =>
                  cancel.mutate(undefined, {
                    onSuccess: () => setMessage("Order cancelled."),
                    onError: (err) =>
                      setMessage(err instanceof Error ? err.message : "Cancel failed"),
                  })
                }
              >
                <XCircle className="h-4 w-4" aria-hidden />
                Cancel order
              </Button>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
