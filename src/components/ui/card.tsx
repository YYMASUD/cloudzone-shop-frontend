import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("border-border bg-card rounded-xl border shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex flex-col gap-1 p-6 pb-4", className)}>{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-lg leading-none font-semibold">{children}</h3>;
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-sm">{children}</p>;
}

export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}
