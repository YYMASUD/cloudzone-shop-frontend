"use client";

import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import { useRemoveFromWishlist, useWishlist } from "@/features/wishlist/queries";
import { useSessionStore } from "@/lib/auth/session-store";
import { formatDateTime, formatMoney } from "@/lib/utils";

export default function WishlistPage() {
  const status = useSessionStore((s) => s.status);
  const { data, isLoading } = useWishlist();
  const remove = useRemoveFromWishlist();

  if (status === "anonymous") {
    return (
      <div className="grid place-items-center gap-4 py-24 text-center">
        <Heart className="text-muted-foreground h-10 w-10" aria-hidden />
        <p className="text-lg font-semibold">Sign in to see your wishlist</p>
        <Link href="/login?next=/wishlist" className="text-primary font-medium hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Wishlist</h1>

      {!data || data.content.length === 0 ? (
        <div className="border-border grid place-items-center gap-3 rounded-xl border border-dashed py-20 text-center">
          <Heart className="text-muted-foreground h-10 w-10" aria-hidden />
          <p className="text-muted-foreground text-sm">Nothing saved yet.</p>
          <Link
            href="/products"
            className="bg-primary text-primary-foreground inline-flex h-10 items-center rounded-lg px-4 text-sm font-medium hover:opacity-90"
          >
            Discover products
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.content.map((item) => (
            <li
              key={item.id}
              className="border-border bg-card flex flex-wrap items-center gap-4 rounded-xl border p-4"
            >
              <div className="min-w-40 flex-1">
                <Link href={`/products/${item.slug}`} className="font-medium hover:underline">
                  {item.name}
                </Link>
                <p className="text-muted-foreground text-xs">
                  Saved {formatDateTime(item.createdAt)}
                </p>
              </div>
              {!item.active ? <Badge tone="warning">Unavailable</Badge> : null}
              <span className="font-semibold">{formatMoney(item.price, item.currency)}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${item.name}`}
                className="text-destructive"
                disabled={remove.isPending}
                onClick={() => remove.mutate(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
