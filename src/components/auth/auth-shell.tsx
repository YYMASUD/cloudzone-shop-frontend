import Link from "next/link";
import type { ReactNode } from "react";
import { Boxes } from "lucide-react";

/** Centered shell for the auth screens. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Boxes className="text-primary h-7 w-7" aria-hidden />
          <span className="text-xl font-bold tracking-tight">CloudZone</span>
        </Link>
        <div className="border-border bg-card rounded-xl border p-6 shadow-sm">
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle ? <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p> : null}
          <div className="mt-6">{children}</div>
        </div>
        {footer ? <div className="text-muted-foreground mt-6 text-center text-sm">{footer}</div> : null}
      </div>
    </main>
  );
}
