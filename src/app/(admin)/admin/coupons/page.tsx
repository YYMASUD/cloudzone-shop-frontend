"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, Plus, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoader } from "@/components/ui/spinner";
import { adminApi } from "@/lib/api";
import { useSession } from "@/lib/auth/use-session";
import { formatDateTime, formatMoney } from "@/lib/utils";
import type { CouponCreateRequest, CouponDiscountType } from "@/lib/api/types";

const EMPTY_FORM: CouponCreateRequest = {
  code: "",
  description: "",
  discountType: "PERCENT",
  discountValue: 10,
  minOrderTotal: null,
  maxRedemptions: null,
  expiresAt: null,
  active: true,
};

export default function AdminCouponsPage() {
  const { user, status } = useSession();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CouponCreateRequest>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const coupons = useQuery({
    queryKey: ["admin", "coupons", page],
    queryFn: () => adminApi.adminListCoupons(page, 20),
    enabled: status === "authenticated" && user?.role === "ADMIN",
  });
  const create = useMutation({
    mutationFn: adminApi.adminCreateCoupon,
    onSuccess: () => {
      setError(null);
      setForm(EMPTY_FORM);
      setShowForm(false);
      void queryClient.invalidateQueries({ queryKey: ["admin", "coupons"] });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Could not create coupon."),
  });

  if (status === "idle" || status === "loading" || (status === "authenticated" && !user)) return <PageLoader />;
  if (status === "anonymous") return <AccessNotice message="Sign in with an administrator account to manage coupons." />;
  if (user?.role !== "ADMIN") return <AccessNotice message="This area is only available to administrators." />;
  if (coupons.isLoading) return <PageLoader />;
  if (coupons.isError || !coupons.data) return <AccessNotice message="Coupons could not be loaded."><Button variant="outline" onClick={() => void coupons.refetch()}>Try again</Button></AccessNotice>;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    create.mutate({
      ...form,
      code: form.code.trim().toUpperCase(),
      description: form.description?.trim() || null,
      minOrderTotal: form.minOrderTotal ?? null,
      maxRedemptions: form.maxRedemptions ?? null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-bold tracking-tight">Coupons</h1><p className="text-muted-foreground mt-2">Create and review store discount codes.</p></div>
        <Button onClick={() => { setShowForm((visible) => !visible); setError(null); }}><Plus className="h-4 w-4" aria-hidden />{showForm ? "Close form" : "Create coupon"}</Button>
      </div>

      {showForm ? (
        <Card><CardHeader><CardTitle>New coupon</CardTitle></CardHeader><CardContent>
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
            <div className="flex flex-col gap-1.5"><Label htmlFor="coupon-code">Code</Label><Input id="coupon-code" required maxLength={64} value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} placeholder="SUMMER20" /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="coupon-type">Discount type</Label><select id="coupon-type" className="border-border bg-card h-10 rounded-lg border px-3 text-sm" value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value as CouponDiscountType })}><option value="PERCENT">Percentage</option><option value="FIXED">Fixed amount</option></select></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="coupon-value">Discount value{form.discountType === "PERCENT" ? " (%)" : ""}</Label><Input id="coupon-value" type="number" required min="0.01" max={form.discountType === "PERCENT" ? 100 : undefined} step="0.01" value={form.discountValue} onChange={(event) => setForm({ ...form, discountValue: Number(event.target.value) })} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="coupon-minimum">Minimum order total (optional)</Label><Input id="coupon-minimum" type="number" min="0" step="0.01" value={form.minOrderTotal ?? ""} onChange={(event) => setForm({ ...form, minOrderTotal: event.target.value ? Number(event.target.value) : null })} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="coupon-limit">Redemption limit (optional)</Label><Input id="coupon-limit" type="number" min="1" step="1" value={form.maxRedemptions ?? ""} onChange={(event) => setForm({ ...form, maxRedemptions: event.target.value ? Number(event.target.value) : null })} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="coupon-expiry">Expiry (optional)</Label><Input id="coupon-expiry" type="datetime-local" value={form.expiresAt ?? ""} onChange={(event) => setForm({ ...form, expiresAt: event.target.value || null })} /></div>
            <div className="flex flex-col gap-1.5 sm:col-span-2"><Label htmlFor="coupon-description">Description (optional)</Label><Input id="coupon-description" maxLength={255} value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active ?? true} onChange={(event) => setForm({ ...form, active: event.target.checked })} /> Active</label>
            {error ? <p role="alert" className="text-destructive text-sm sm:col-span-2">{error}</p> : null}
            <div className="sm:col-span-2"><Button type="submit" disabled={create.isPending}>{create.isPending ? "Creating…" : "Create coupon"}</Button></div>
          </form>
        </CardContent></Card>
      ) : null}

      {coupons.data.content.length === 0 ? (
        <Card><CardContent className="text-muted-foreground grid place-items-center gap-3 py-12 text-center"><Tag className="h-8 w-8" aria-hidden /><p>No coupons on this page yet.</p></CardContent></Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {coupons.data.content.map((coupon) => (
            <Card key={coupon.id}><CardContent className="flex flex-col gap-3 pt-6">
              <div className="flex items-center justify-between gap-3"><code className="text-lg font-bold tracking-wide">{coupon.code}</code><Badge tone="success">{coupon.discountType === "PERCENT" ? `${coupon.discountValue}% off` : `${coupon.discountValue} off`}</Badge></div>
              {coupon.description ? <p className="text-muted-foreground text-sm">{coupon.description}</p> : null}
              <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">{coupon.minOrderTotal !== null ? <span>Minimum: {formatMoney(coupon.minOrderTotal)}</span> : null}{coupon.expiresAt ? <span>Expires: {formatDateTime(coupon.expiresAt)}</span> : <span>No expiry</span>}</div>
            </CardContent></Card>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-4"><p className="text-muted-foreground text-sm">Page {page + 1} of {Math.max(coupons.data.totalPages, 1)}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))}>Previous</Button><Button variant="outline" size="sm" disabled={page + 1 >= coupons.data.totalPages} onClick={() => setPage((current) => current + 1)}>Next</Button></div></div>
    </div>
  );
}

function AccessNotice({ message, children }: { message: string; children?: React.ReactNode }) {
  return <div className="border-border grid place-items-center gap-3 rounded-xl border border-dashed px-6 py-20 text-center"><CircleAlert className="text-muted-foreground h-8 w-8" aria-hidden /><p className="text-muted-foreground text-sm">{message}</p>{children}</div>;
}
