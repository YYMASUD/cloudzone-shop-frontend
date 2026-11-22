"use client";

import Link from "next/link";
import { use, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, statusTone } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/spinner";
import { useProduct, useProductVariants } from "@/features/catalog/queries";
import { useAddToCart } from "@/features/cart/use-cart";
import { useAddToWishlist } from "@/features/wishlist/queries";
import { useSessionStore } from "@/lib/auth/session-store";
import { ProductImage } from "@/features/catalog/product-card";
import { ProductReviews } from "@/features/catalog/product-reviews";
import { ApiClientError } from "@/lib/api/errors";
import { formatMoney } from "@/lib/utils";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: product, isLoading, error } = useProduct(slug);
  const { data: variants } = useProductVariants(slug);

  if (isLoading) return <PageLoader />;

  if (error instanceof ApiClientError && error.isNotFound) {
    return (
      <div className="grid place-items-center gap-3 py-24 text-center">
        <p className="text-lg font-semibold">Product not found</p>
        <p className="text-muted-foreground text-sm">
          It may have been removed. <Link href="/products" className="underline">Keep browsing</Link>.
        </p>
      </div>
    );
  }

  if (!product) return <PageLoader />;

  return (
    <div className="flex flex-col gap-12">
      <nav className="text-muted-foreground text-sm">
        <Link href="/products" className="hover:underline">
          Products
        </Link>
        {product.categoryName ? (
          <>
            {" / "}
            <Link href={`/products?category=${product.categorySlug}`} className="hover:underline">
              {product.categoryName}
            </Link>
          </>
        ) : null}
        {" / "}
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductImage product={product} className="aspect-square w-full" />

        <div className="flex flex-col gap-4">
          {product.brandName ? (
            <span className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
              {product.brandName}
            </span>
          ) : null}
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold">
              {formatMoney(product.price, product.currency)}
            </span>
            {product.compareAtPrice != null && product.compareAtPrice > product.price ? (
              <>
                <span className="text-muted-foreground line-through">
                  {formatMoney(product.compareAtPrice, product.currency)}
                </span>
                <Badge tone="success">Sale</Badge>
              </>
            ) : null}
          </div>

          <Badge tone={statusTone(product.inStock ? "SUCCEEDED" : "FAILED")}>
            {product.inStock ? `In stock · ${product.stockQuantity}` : "Out of stock"}
          </Badge>

          {product.description ? (
            <p className="text-muted-foreground text-sm whitespace-pre-line">
              {product.description}
            </p>
          ) : null}

          <dl className="border-border grid grid-cols-2 gap-x-6 gap-y-2 border-t pt-4 text-sm">
            <dt className="text-muted-foreground">SKU</dt>
            <dd className="font-mono">{product.sku}</dd>
            {variants && variants.length > 0 ? (
              <>
                <dt className="text-muted-foreground">Variants</dt>
                <dd>{variants.length}</dd>
              </>
            ) : null}
          </dl>

          <AddToCartSection productId={product.id} inStock={product.inStock} />
        </div>
      </div>

      {variants && variants.length > 0 ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Variants</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {variants.map((variant) => (
              <div key={variant.id} className="border-border bg-card rounded-xl border p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{variant.name}</span>
                  <span className="text-sm font-semibold">
                    {formatMoney(variant.effectivePrice, variant.currency)}
                  </span>
                </div>
                {variant.options ? (
                  <p className="text-muted-foreground mt-1 text-xs">{variant.options}</p>
                ) : null}
                <p className="mt-2 text-xs">
                  {variant.inStock ? (
                    <span className="text-emerald-600">{variant.stockQuantity} in stock</span>
                  ) : (
                    <span className="text-destructive">Out of stock</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <ProductReviews productId={product.id} />
    </div>
  );
}

function AddToCartSection({ productId, inStock }: { productId: number; inStock: boolean }) {
  const status = useSessionStore((s) => s.status);
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const signedIn = status === "authenticated";

  function handleAddToCart() {
    setMessage(null);
    addToCart.mutate(
      { productId, quantity },
      {
        onSuccess: () => setMessage("Added to cart"),
        onError: (err) => setMessage(err instanceof Error ? err.message : "Failed"),
      },
    );
  }

  function handleWishlist() {
    setMessage(null);
    addToWishlist.mutate(productId, {
      onSuccess: () => setMessage("Saved to wishlist"),
      onError: (err) => setMessage(err instanceof Error ? err.message : "Failed"),
    });
  }

  if (!signedIn) {
    return (
      <div className="border-border mt-2 rounded-xl border border-dashed p-4">
        <p className="text-muted-foreground text-sm">
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>{" "}
          to add items to your cart or wishlist.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="text-sm font-medium">
          Qty
        </label>
        <input
          id="qty"
          type="number"
          min={1}
          max={999}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          className="border-border bg-card h-10 w-20 rounded-lg border px-3 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button size="lg" disabled={!inStock || addToCart.isPending} onClick={handleAddToCart}>
          <ShoppingCart className="h-4 w-4" aria-hidden />
          {inStock ? "Add to cart" : "Out of stock"}
        </Button>
        <Button size="lg" variant="outline" disabled={addToWishlist.isPending} onClick={handleWishlist}>
          <Heart className="h-4 w-4" aria-hidden />
          Wishlist
        </Button>
      </div>
      {message ? <p className="text-muted-foreground text-sm">{message}</p> : null}
    </div>
  );
}
