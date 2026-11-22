"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoader, Spinner } from "@/components/ui/spinner";
import { useBrands, useCategories, useProducts } from "@/features/catalog/queries";
import { ProductCard } from "@/features/catalog/product-card";
import type { ProductSort } from "@/lib/api/types";

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name A–Z" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
];

const PAGE_SIZE = 12;

function ProductsBrowser() {
  const params = useSearchParams();

  // URL is the source of truth; local state edits it through updateParams.
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "");
  const [brand, setBrand] = useState(params.get("brand") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") ?? "");
  const [sort, setSort] = useState<ProductSort>((params.get("sort") as ProductSort) ?? "newest");
  const [page, setPage] = useState(Number(params.get("page") ?? 0));

  useEffect(() => {
    setQ(params.get("q") ?? "");
    setCategory(params.get("category") ?? "");
    setBrand(params.get("brand") ?? "");
  }, [params]);

  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data, isFetching, isLoading } = useProducts({
    q: q || undefined,
    category: category || undefined,
    brand: brand || undefined,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    sort,
    page,
    size: PAGE_SIZE,
  });

  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm">
            {data ? `${data.totalElements} products` : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="sort" className="text-xs">
            Sort
          </Label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as ProductSort);
              setPage(0);
            }}
            className="border-border bg-card h-9 rounded-lg border px-2 text-sm"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-q">Search</Label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPage(0);
              }}
            >
              <Input
                id="filter-q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name…"
              />
            </form>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-category">Category</Label>
            <select
              id="filter-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(0);
              }}
              className="border-border bg-card h-10 rounded-lg border px-2 text-sm"
            >
              <option value="">All categories</option>
              {(categories ?? []).map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-brand">Brand</Label>
            <select
              id="filter-brand"
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                setPage(0);
              }}
              className="border-border bg-card h-10 rounded-lg border px-2 text-sm"
            >
              <option value="">All brands</option>
              {(brands ?? []).map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Price range</Label>
            <div className="flex items-center gap-2">
              <Input
                aria-label="Minimum price"
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
              />
              <span className="text-muted-foreground text-xs">–</span>
              <Input
                aria-label="Maximum price"
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
              />
            </div>
          </div>
        </aside>

        <section>
          {isLoading ? (
            <PageLoader />
          ) : !data || data.content.length === 0 ? (
            <div className="border-border grid place-items-center gap-3 rounded-xl border border-dashed py-24">
              <SearchX className="text-muted-foreground h-10 w-10" aria-hidden />
              <p className="text-muted-foreground text-sm">No products match these filters.</p>
            </div>
          ) : (
            <>
              <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-3">
                {data.content.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
                {isFetching ? (
                  <div className="bg-background/60 absolute inset-0 grid place-items-center">
                    <Spinner />
                  </div>
                ) : null}
              </div>

              {totalPages > 1 ? (
                <nav className="mt-8 flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    Prev
                  </Button>
                  <span className="text-muted-foreground text-sm">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.last}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Button>
                </nav>
              ) : null}
            </>
          )}
        </section>
      </div>

      <p className="text-muted-foreground text-center text-xs">
        Looking for something specific?{" "}
        <Link href="/categories" className="underline">
          Browse categories
        </Link>
      </p>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProductsBrowser />
    </Suspense>
  );
}
