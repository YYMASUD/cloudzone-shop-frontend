"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CreditCard, Landmark, ShoppingBag, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoader } from "@/components/ui/spinner";
import { useCart } from "@/features/cart/use-cart";
import { useAddresses } from "@/features/account/use-addresses";
import { useShippingMethods } from "@/features/checkout/use-shipping-methods";
import { CouponInput } from "@/features/checkout/coupon-input";
import { useCheckout } from "@/features/orders/queries";
import { useSessionStore } from "@/lib/auth/session-store";
import type { AddressResponse, CheckoutAddressRequest, PaymentMethod } from "@/lib/api/types";
import { cn, formatMoney } from "@/lib/utils";

const PAYMENT_METHODS: { value: PaymentMethod; label: string; hint: string; icon: typeof CreditCard }[] = [
  { value: "STRIPE", label: "Card (Stripe)", hint: "Visa, Mastercard, Amex", icon: CreditCard },
  { value: "RAZORPAY", label: "Razorpay", hint: "UPI, cards, netbanking", icon: Wallet },
  { value: "PAYPAL", label: "PayPal", hint: "PayPal balance or card", icon: Wallet },
  { value: "SSLCOMMERZ", label: "SSLCommerz", hint: "Local banks & mobile money", icon: Landmark },
  { value: "COD", label: "Cash on delivery", hint: "Pay when it arrives", icon: ShoppingBag },
];

/** Address picker: reuse a saved address or type a new one. */
function AddressPicker({
  addresses,
  selectedId,
  onSelectId,
  onNewAddress,
  newAddress,
  title,
}: {
  addresses: AddressResponse[];
  selectedId: number | null;
  onSelectId: (id: number | null) => void;
  newAddress: CheckoutAddressRequest;
  onNewAddress: (addr: CheckoutAddressRequest) => void;
  title: string;
}) {
  return (
    <fieldset className="border-border bg-card rounded-xl border p-5">
      <legend className="px-1 text-sm font-semibold">{title}</legend>

      <div className="flex flex-col gap-2">
        {addresses.map((address) => (
          <label
            key={address.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm",
              selectedId === address.id ? "border-primary ring-primary/20 ring-1" : "border-border",
            )}
          >
            <input
              type="radio"
              name={`${title}-address`}
              className="mt-1"
              checked={selectedId === address.id}
              onChange={() => onSelectId(address.id)}
            />
            <span>
              <span className="font-medium">
                {address.label ? `${address.label} · ` : ""}
                {address.recipientName}
              </span>
              <span className="text-muted-foreground block">
                {address.line1}
                {address.line2 ? `, ${address.line2}` : ""}, {address.city}{" "}
                {address.postalCode}, {address.country}
              </span>
            </span>
          </label>
        ))}

        <label
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm",
            selectedId === null ? "border-primary ring-primary/20 ring-1" : "border-border",
          )}
        >
          <input
            type="radio"
            name={`${title}-address`}
            checked={selectedId === null}
            onChange={() => onSelectId(null)}
          />
          Use a new address
        </label>

        {selectedId === null ? (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="col-span-2">
              <Input
                aria-label="Recipient name"
                placeholder="Recipient name"
                value={newAddress.recipientName}
                onChange={(e) => onNewAddress({ ...newAddress, recipientName: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Input
                aria-label="Address line 1"
                placeholder="Address line 1"
                value={newAddress.line1}
                onChange={(e) => onNewAddress({ ...newAddress, line1: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Input
                aria-label="Address line 2"
                placeholder="Address line 2 (optional)"
                value={newAddress.line2 ?? ""}
                onChange={(e) => onNewAddress({ ...newAddress, line2: e.target.value || null })}
              />
            </div>
            <Input
              aria-label="City"
              placeholder="City"
              value={newAddress.city}
              onChange={(e) => onNewAddress({ ...newAddress, city: e.target.value })}
            />
            <Input
              aria-label="Postal code"
              placeholder="Postal code"
              value={newAddress.postalCode ?? ""}
              onChange={(e) => onNewAddress({ ...newAddress, postalCode: e.target.value || null })}
            />
            <Input
              aria-label="Country code"
              placeholder="Country (BD, US…)"
              maxLength={2}
              value={newAddress.country}
              onChange={(e) =>
                onNewAddress({ ...newAddress, country: e.target.value.toUpperCase() })
              }
            />
          </div>
        ) : null}
      </div>
    </fieldset>
  );
}

function CheckoutInner() {
  const router = useRouter();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: addresses, isLoading: addressesLoading } = useAddresses();
  const { data: methods, isLoading: methodsLoading } = useShippingMethods();
  const checkout = useCheckout();

  const [shippingId, setShippingId] = useState<number | null>(null);
  const [billingId, setBillingId] = useState<number | null>(null);
  const [newShipping, setNewShipping] = useState<CheckoutAddressRequest>({
    recipientName: "",
    line1: "",
    city: "",
    country: "",
  });
  const [newBilling, setNewBilling] = useState<CheckoutAddressRequest>({
    recipientName: "",
    line1: "",
    city: "",
    country: "",
  });
  const [sameBilling, setSameBilling] = useState(true);
  const [shippingCode, setShippingCode] = useState("");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("STRIPE");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const savedAddresses = useMemo(() => addresses ?? [], [addresses]);

  useEffect(() => {
    const firstDefault = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];
    if (firstDefault && shippingId === null && billingId === null) {
      setShippingId(firstDefault.id);
      setBillingId(firstDefault.id);
    }
  }, [savedAddresses, shippingId, billingId]);

  useEffect(() => {
    if (!shippingCode && methods && methods.length > 0) {
      setShippingCode(methods[0].code);
    }
  }, [methods, shippingCode]);

  const selectedMethod = methods?.find((m) => m.code === shippingCode);
  const estimatedTotal = (cart?.subtotal ?? 0) + (selectedMethod?.flatRate ?? 0);

  async function placeOrder(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const body =
      shippingId !== null
        ? { shippingAddressId: shippingId, billingAddressId: sameBilling ? shippingId : billingId }
        : { shippingAddress: newShipping, billingAddress: sameBilling ? newShipping : newBilling };

    checkout.mutate(
      {
        ...body,
        shippingMethodCode: shippingCode,
        couponCode: couponCode ?? undefined,
        paymentMethod,
        notes: notes || undefined,
      },
      {
        onSuccess: (order) => {
          router.push(`/orders/${order.orderNumber}`);
        },
        onError: (err) => setError(err instanceof Error ? err.message : "Checkout failed"),
      },
    );
  }

  if (cartLoading || addressesLoading || methodsLoading) return <PageLoader />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="grid place-items-center gap-4 py-24 text-center">
        <ShoppingBag className="text-muted-foreground h-10 w-10" aria-hidden />
        <p className="text-lg font-semibold">Nothing to check out</p>
        <Link href="/products" className="text-primary text-sm font-medium hover:underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={placeOrder} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-6">
        <AddressPicker
          title="Shipping address"
          addresses={savedAddresses}
          selectedId={shippingId}
          onSelectId={setShippingId}
          newAddress={newShipping}
          onNewAddress={setNewShipping}
        />

        <div className="border-border bg-card rounded-xl border p-5">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={sameBilling}
              onChange={(e) => setSameBilling(e.target.checked)}
            />
            Billing address is the same as shipping
          </label>
          {!sameBilling ? (
            <div className="mt-4">
              <AddressPicker
                title="Billing address"
                addresses={savedAddresses}
                selectedId={billingId}
                onSelectId={setBillingId}
                newAddress={newBilling}
                onNewAddress={setNewBilling}
              />
            </div>
          ) : null}
        </div>

        <fieldset className="border-border bg-card rounded-xl border p-5">
          <legend className="px-1 text-sm font-semibold">Shipping method</legend>
          <div className="flex flex-col gap-2">
            {(methods ?? []).map((method) => (
              <label
                key={method.code}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 text-sm",
                  shippingCode === method.code
                    ? "border-primary ring-primary/20 ring-1"
                    : "border-border",
                )}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingCode === method.code}
                    onChange={() => setShippingCode(method.code)}
                  />
                  <span>
                    <span className="font-medium">{method.name}</span>
                    {method.estimatedDays ? (
                      <span className="text-muted-foreground block text-xs">
                        ~{method.estimatedDays} days
                      </span>
                    ) : null}
                  </span>
                </span>
                <span className="font-semibold">{formatMoney(method.flatRate)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="border-border bg-card rounded-xl border p-5">
          <legend className="px-1 text-sm font-semibold">Payment</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {PAYMENT_METHODS.map(({ value, label, hint, icon: Icon }) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm",
                  paymentMethod === value
                    ? "border-primary ring-primary/20 ring-1"
                    : "border-border",
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  className="mt-1"
                  checked={paymentMethod === value}
                  onChange={() => setPaymentMethod(value)}
                />
                <span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </span>
                  <span className="text-muted-foreground block text-xs">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="border-border bg-card h-fit rounded-xl border p-5">
        <h2 className="font-semibold">Order summary</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span className="line-clamp-1">
                {item.name} × {item.quantity}
              </span>
              <span>{formatMoney(item.lineTotal, cart.currency)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <CouponInput
            subtotal={cart.subtotal}
            onValidated={(coupon) => setCouponCode(coupon.code)}
            onCleared={() => setCouponCode(null)}
          />
        </div>

        <dl className="border-border mt-4 flex flex-col gap-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{formatMoney(cart.subtotal, cart.currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{selectedMethod ? formatMoney(selectedMethod.flatRate) : "—"}</dd>
          </div>
          {couponCode ? (
            <div className="flex justify-between text-emerald-600">
              <dt>Coupon {couponCode}</dt>
              <dd>applied at order</dd>
            </div>
          ) : null}
          <div className="border-border flex justify-between border-t pt-2 text-base font-bold">
            <dt>Estimated total</dt>
            <dd>{formatMoney(estimatedTotal, cart.currency)}</dd>
          </div>
        </dl>

        <div className="mt-4">
          <Label htmlFor="notes">Order notes (optional)</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            className="mt-1"
          />
        </div>

        {error ? <p className="text-destructive mt-3 text-sm">{error}</p> : null}

        <Button
          type="submit"
          size="lg"
          className="mt-4 w-full"
          disabled={checkout.isPending || !shippingCode}
        >
          {checkout.isPending ? "Placing order…" : "Place order"}
        </Button>
        <p className="text-muted-foreground mt-2 text-center text-xs">
          Payment is captured on the next step.
        </p>
      </aside>
    </form>
  );
}

export default function CheckoutPage() {
  const status = useSessionStore((s) => s.status);

  if (status === "anonymous") {
    return (
      <div className="grid place-items-center gap-4 py-24 text-center">
        <p className="text-lg font-semibold">Sign in to check out</p>
        <Link href="/login?next=/checkout" className="text-primary font-medium hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>
      <CheckoutInner />
    </div>
  );
}
