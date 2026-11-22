"use client";

import { useState } from "react";
import { TicketPercent } from "lucide-react";
import { accountApi } from "@/lib/api";
import type { CouponResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/utils";

type ValidateFn = (code: string, subtotal?: number) => Promise<CouponResponse>;

/**
 * Coupon code input + validate button. The backend validates and returns the
 * mechanics; discount display is informational — the order totals at checkout
 * are authoritative.
 */
export function CouponInput({
  subtotal,
  onValidated,
  onCleared,
}: {
  subtotal: number;
  onValidated: (coupon: CouponResponse) => void;
  onCleared: () => void;
}) {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<CouponResponse | null>(null);

  async function apply() {
    if (!code.trim()) return;
    setError(null);
    setChecking(true);
    try {
      const validate = accountApi.validateCoupon as unknown as ValidateFn;
      const result = await validate(code.trim(), subtotal);
      setCoupon(result);
      onValidated(result);
    } catch (err) {
      setCoupon(null);
      onCleared();
      setError(err instanceof Error ? err.message : "Coupon could not be applied");
    } finally {
      setChecking(false);
    }
  }

  function clear() {
    setCode("");
    setCoupon(null);
    setError(null);
    onCleared();
  }

  if (coupon) {
    const discount =
      coupon.discountType === "PERCENT"
        ? `${coupon.discountValue}% off`
        : `${formatMoney(coupon.discountValue)} off`;
    return (
      <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm dark:border-emerald-800 dark:bg-emerald-950">
        <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <TicketPercent className="h-4 w-4" aria-hidden />
          <span className="font-mono font-medium">{coupon.code}</span> — {discount}
        </span>
        <button type="button" onClick={clear} className="text-xs underline">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          className="border-border bg-card h-10 flex-1 rounded-lg border px-3 font-mono text-sm uppercase"
        />
        <button
          type="button"
          onClick={apply}
          disabled={checking || !code.trim()}
          className="border-border hover:bg-border/40 h-10 rounded-lg border px-4 text-sm font-medium disabled:opacity-50"
        >
          {checking ? "Checking…" : "Apply"}
        </button>
      </div>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
