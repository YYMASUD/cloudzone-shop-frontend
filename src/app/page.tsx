import { Boxes } from 'lucide-react';

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center p-8">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <Boxes className="h-12 w-12 text-emerald-600" aria-hidden />
        <h1 className="text-3xl font-bold tracking-tight">CloudZone Shop</h1>
        <p className="text-muted-foreground text-balance text-sm">
          Storefront for the CloudZone e-commerce API. Catalog, cart, checkout and account pages
          are being built — see the README for the phase plan.
        </p>
      </div>
    </main>
  );
}
