"use client";

import Link from "next/link";
import { PageLoader } from "@/components/ui/spinner";
import { useBrands } from "@/features/catalog/queries";

export default function BrandsPage() {
  const { data: brands, isLoading } = useBrands();

  if (isLoading) return <PageLoader />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
        <p className="text-muted-foreground text-sm">Shop by brand.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(brands ?? []).map((brand) => (
          <Link
            key={brand.slug}
            href={`/products?brand=${brand.slug}`}
            className="border-border bg-card hover:shadow-md rounded-xl border p-5 transition-shadow"
          >
            <span className="font-semibold">{brand.name}</span>
            {brand.description ? (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                {brand.description}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
