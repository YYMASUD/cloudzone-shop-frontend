import Link from "next/link";
import { Boxes } from "lucide-react";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/categories", label: "Categories" },
      { href: "/brands", label: "Brands" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/account", label: "Profile" },
      { href: "/orders", label: "Orders" },
      { href: "/wishlist", label: "Wishlist" },
      { href: "/notifications", label: "Notifications" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/shipping", label: "Shipping" },
      { href: "/returns", label: "Returns" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-border bg-card mt-16 border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <Boxes className="text-primary h-6 w-6" aria-hidden />
            <span className="text-lg font-bold tracking-tight">CloudZone</span>
          </Link>
          <p className="text-muted-foreground mt-3 text-sm">
            E-commerce storefront powered by a Spring Boot API.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="text-sm font-semibold">{column.title}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-border border-t">
        <div className="text-muted-foreground mx-auto max-w-6xl px-4 py-6 text-xs">
          © {new Date().getFullYear()} CloudZone. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
