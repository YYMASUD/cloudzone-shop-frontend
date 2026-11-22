import Link from "next/link";
import { ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProductResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/utils";

/** Product image via the media objectKey; falls back to a placeholder tile. */
export function ProductImage({
  product,
  className,
}: {
  product: Pick<ProductResponse, "name" | "imageKey">;
  className?: string;
}) {
  if (!product.imageKey) {
    return (
      <div
        className={`border-border bg-border/20 grid place-items-center rounded-lg ${className ?? ""}`}
      >
        <ImageOff className="text-muted-foreground h-8 w-8" aria-hidden />
      </div>
    );
  }
  // Backend serves media by object key; adjust once the media URL scheme is known.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/media/${encodeURIComponent(product.imageKey)}`}
      alt={product.name}
      className={`rounded-lg object-cover ${className ?? ""}`}
      loading="lazy"
    />
  );
}

/** Compact product tile used in grids and related-products rails. */
export function ProductCard({ product }: { product: ProductResponse }) {
  const discounted =
    product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="border-border bg-card group flex flex-col overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md"
    >
      <ProductImage product={product} className="aspect-square w-full rounded-none border-b" />
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.brandName ? (
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {product.brandName}
          </span>
        ) : null}
        <h3 className="line-clamp-2 text-sm font-medium">{product.name}</h3>
        <div className="mt-auto flex items-baseline gap-2 pt-2">
          <span className="text-base font-semibold">
            {formatMoney(product.price, product.currency)}
          </span>
          {discounted ? (
            <span className="text-muted-foreground text-xs line-through">
              {formatMoney(product.compareAtPrice!, product.currency)}
            </span>
          ) : null}
        </div>
        {!product.inStock ? (
          <Badge tone="danger">Out of stock</Badge>
        ) : discounted ? (
          <Badge tone="success">Sale</Badge>
        ) : null}
      </div>
    </Link>
  );
}
