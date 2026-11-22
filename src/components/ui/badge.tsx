import { cn } from "@/lib/utils";

const tones = {
  neutral: "border-border bg-border/30 text-foreground",
  success: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  danger: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  info: "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300",
} as const;

export type BadgeTone = keyof typeof tones;

/** Small status pill; tone is usually derived from an enum (order/payment status). */
export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

/** Maps backend enum values to badge tones. */
export function statusTone(status: string): BadgeTone {
  switch (status) {
    case "PAID":
    case "SUCCEEDED":
    case "DELIVERED":
    case "COMMITTED":
      return "success";
    case "PROCESSING":
    case "SHIPPED":
    case "PENDING":
    case "INITIATED":
    case "ACTIVE":
      return "info";
    case "CANCELLED":
    case "FAILED":
    case "RELEASED":
      return "danger";
    case "REFUNDED":
      return "warning";
    default:
      return "neutral";
  }
}
