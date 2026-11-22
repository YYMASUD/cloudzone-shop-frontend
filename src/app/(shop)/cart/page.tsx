"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/spinner";
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from "@/features/cart/use-cart";
import { useSessionStore } from "@/lib/auth/session-store";
import { formatMoney } from "@/lib/utils";

/** Full cart page; quantities patch the server cart and the cache updates in place. */
export default function CartPage() {
  const status = useSessionStore((s) => s.status);
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  if (status !== "authenticated") {
    return (
      <div className="grid place-items-center gap-4 py-24 text-center">
        <ShoppingBag className="text-muted-foreground h-10 w-10" aria-hidden />
        <p className="text-lg font-semibold">Your cart is waiting</p>
        <p className="text-muted-foreground text-sm">
          <Link href="/login?next=/cart" className="text-primary font-medium hover:underline">
            Sign in
          </Link>{" "}
          to view your cart.
        </p>
      </div>
    );
  }

  if (isLoading) return <PageLoader />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="grid place-items-center gap-4 py-24 text-center">
        <ShoppingBag className="text-muted-foreground h-10 w-10" aria-hidden />
        <p className="text-lg font-semibold">Your cart is empty</p>
        <Link
          href="/products"
          className="bg-primary text-primary-foreground inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium hover:opacity-90"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Cart{" "}
        <span className="text-muted-foreground text-base font-normal">
          ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})
        </span>
      </h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <ul className="flex flex-col divide-y">
          {cart.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.slug}`}
                  className="line-clamp-1 font-medium hover:underline"
                >
                  {item.name}
                </Link>
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {formatMoney(item.unitPrice, cart.currency)} each
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Decrease quantity"
                  disabled={updateItem.isPending || item.quantity <= 1}
                  onClick={() =>
                    updateItem.mutate({ id: item.id, body: { quantity: item.quantity - 1 } })
                  }
                >
                  <Minus className="h-3.5 w-3.5" />
                </Button>
                <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Increase quantity"
                  disabled={updateItem.isPending}
                  onClick={() =>
                    updateItem.mutate({ id: item.id, body: { quantity: item.quantity + 1 } })
                  }
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <span className="w-24 text-right text-sm font-semibold">
                {formatMoney(item.lineTotal, cart.currency)}
              </span>

              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${item.name}`}
                className="text-destructive"
                disabled={removeItem.isPending}
                onClick={() => removeItem.mutate(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>

        <aside className="border-border bg-card h-fit rounded-xl border p-5">
          <h2 className="font-semibold">Summary</h2>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium">{formatMoney(cart.subtotal, cart.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-muted-foreground text-xs">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="border-border mt-4 flex items-baseline justify-between border-t pt-4">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold">
              {formatMoney(cart.subtotal, cart.currency)}
            </span>
          </div>
          <Link href="/checkout" className="mt-4 block">
            <Button size="lg" className="w-full">
              Checkout
            </Button>
          </Link>
        </aside>
      </div>
    </div>
  );
}
