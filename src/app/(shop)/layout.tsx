import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

/** Public storefront shell: sticky header + footer around every shop page. */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
