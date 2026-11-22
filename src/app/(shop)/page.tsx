import Link from "next/link";
import { ArrowRight, PackageSearch } from "lucide-react";

/** Temporary home while the catalog pages land in Phase 5. */
export default function HomePage() {
  return (
    <div className="grid place-items-center py-24">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <PackageSearch className="text-primary h-12 w-12" aria-hidden />
        <h1 className="text-3xl font-bold tracking-tight">Shop the catalog</h1>
        <p className="text-muted-foreground text-sm">
          Product listings are coming together. Browse what&apos;s in stock so far.
        </p>
        <Link
          href="/products"
          className="bg-primary text-primary-foreground inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-medium hover:opacity-90"
        >
          Browse products
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
