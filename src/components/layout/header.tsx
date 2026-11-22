"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Boxes,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { catalogApi } from "@/lib/api";
import { useSession } from "@/lib/auth/use-session";
import { useUnreadCount } from "@/features/notifications/use-unread-count";
import { useCart } from "@/features/cart/use-cart";
import { cn } from "@/lib/utils";

/** Storefront header: brand, category nav, search, cart/wishlist/account. */
export function Header() {
  const { user, status, logout } = useSession();
  const { unread } = useUnreadCount();
  const { data: cart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cartCount = status === "authenticated" ? (cart?.itemCount ?? 0) : 0;

  return (
    <header className="border-border bg-card/95 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Boxes className="text-primary h-6 w-6" aria-hidden />
          <span className="text-lg font-bold tracking-tight">CloudZone</span>
        </Link>

        <CategoryNav className="hidden md:flex" />

        <div className="ml-auto flex items-center gap-1">
          <SearchButton />
          <CartButton count={cartCount} />
          {status === "authenticated" ? (
            <AccountMenu
              name={user?.firstName ?? user?.email ?? "Account"}
              isAdmin={user?.role === "ADMIN"}
              unread={unread ?? 0}
              onLogout={logout}
            />
          ) : (
            <Link
              href="/login"
              className="hover:bg-border/40 hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium sm:inline-flex"
            >
              <User className="h-4 w-4" aria-hidden />
              Sign in
            </Link>
          )}
          <button
            type="button"
            className="hover:bg-border/40 inline-flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-border border-t md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            <CategoryNav vertical onNavigate={() => setMobileOpen(false)} />
            {status !== "authenticated" ? (
              <Link
                href="/login"
                className="hover:bg-border/40 rounded-lg px-3 py-2 text-sm font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

/** Top-level category links; hidden behind a query so it renders empty while loading. */
function CategoryNav({ className, vertical, onNavigate }: {
  className?: string;
  vertical?: boolean;
  onNavigate?: () => void;
}) {
  const { data: categories } = useQuery({
    queryKey: ["catalog", "categories"],
    queryFn: () => catalogApi.listCategories(),
    staleTime: 5 * 60_000,
  });

  const roots = (categories ?? []).filter((c) => !c.parentSlug).slice(0, 6);

  return (
    <nav className={cn(vertical ? "flex flex-col" : "flex items-center gap-1", className)}>
      {roots.map((category) => (
        <Link
          key={category.slug}
          href={`/categories/${category.slug}`}
          className={cn(
            "hover:bg-border/40 rounded-lg px-3 py-2 text-sm font-medium",
            vertical && "w-full",
          )}
          onClick={onNavigate}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}

function SearchButton() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative">
      <button
        type="button"
        className="hover:bg-border/40 inline-flex h-10 w-10 items-center justify-center rounded-lg"
        aria-label="Search products"
        onClick={() => setOpen((v) => !v)}
      >
        <Search className="h-5 w-5" />
      </button>
      {open ? (
        <form
          className="border-border bg-card absolute right-0 top-12 w-72 rounded-xl border p-2 shadow-lg"
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
            router.push(`/products?q=${encodeURIComponent(query)}`);
          }}
        >
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="border-border bg-background h-9 w-full rounded-lg border px-3 text-sm focus:outline-none"
          />
        </form>
      ) : null}
    </div>
  );
}

function CartButton({ count }: { count: number }) {
  return (
    <Link
      href="/cart"
      className="hover:bg-border/40 relative inline-flex h-10 w-10 items-center justify-center rounded-lg"
      aria-label={`Cart, ${count} items`}
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 ? (
        <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-semibold">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

function AccountMenu({
  name,
  isAdmin,
  unread,
  onLogout,
}: {
  name: string;
  isAdmin: boolean;
  unread: number;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);

  const items = [
    { href: "/account", label: "Profile", icon: User },
    { href: "/orders", label: "Orders", icon: Package },
    { href: "/wishlist", label: "Wishlist", icon: Heart },
    { href: "/notifications", label: `Notifications${unread ? ` (${unread})` : ""}`, icon: Package },
    ...(isAdmin ? [{ href: "/admin", label: "Admin", icon: LayoutDashboard }] : []),
  ];

  return (
    <div className="relative">
      <button
        type="button"
        className="hover:bg-border/40 inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <User className="h-5 w-5" aria-hidden />
        <span className="hidden max-w-24 truncate sm:inline">{name}</span>
      </button>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-30 cursor-default"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="border-border bg-card absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-xl border shadow-lg"
          >
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                role="menuitem"
                className="hover:bg-border/40 flex items-center gap-2 px-4 py-2.5 text-sm"
                onClick={() => setOpen(false)}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            ))}
            <button
              type="button"
              role="menuitem"
              className="hover:bg-border/40 text-destructive flex w-full items-center gap-2 border-t px-4 py-2.5 text-sm"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
