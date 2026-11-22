"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageLoader } from "@/components/ui/spinner";
import { useCategories } from "@/features/catalog/queries";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) return <PageLoader />;

  const roots = (categories ?? []).filter((c) => !c.parentSlug);
  const childrenOf = (slug: string) => (categories ?? []).filter((c) => c.parentSlug === slug);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-muted-foreground text-sm">Browse the catalog by category.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roots.map((category) => {
          const children = childrenOf(category.slug);
          return (
            <div key={category.slug} className="border-border bg-card rounded-xl border p-5">
              <Link
                href={`/products?category=${category.slug}`}
                className="flex items-center gap-1 font-semibold hover:underline"
              >
                {category.name}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
              {category.description ? (
                <p className="text-muted-foreground mt-1 text-sm">{category.description}</p>
              ) : null}
              {children.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {children.map((child) => (
                    <li key={child.slug}>
                      <Link
                        href={`/products?category=${child.slug}`}
                        className="border-border hover:bg-border/40 rounded-full border px-3 py-1 text-xs"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
