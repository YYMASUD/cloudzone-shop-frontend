"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MapPin, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageLoader } from "@/components/ui/spinner";
import { authApi } from "@/lib/api";
import { useSession } from "@/lib/auth/use-session";
import { useSessionStore } from "@/lib/auth/session-store";
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "@/features/account/use-addresses";
import type { AddressCreateRequest } from "@/lib/api/types";

const EMPTY_ADDRESS: AddressCreateRequest = {
  recipientName: "",
  line1: "",
  city: "",
  country: "",
  label: "",
};

export default function AccountPage() {
  const status = useSessionStore((s) => s.status);
  const { user, setUser } = useSession();

  const [profile, setProfile] = useState<{ firstName: string; lastName: string } | null>(null);
  const saveProfile = useMutation({
    mutationFn: (body: { firstName?: string | null; lastName?: string | null }) =>
      authApi.updateProfile(body),
    onSuccess: (updated) => setUser(updated),
  });

  if (status === "anonymous") {
    return (
      <div className="grid place-items-center gap-4 py-24 text-center">
        <p className="text-lg font-semibold">Sign in to manage your account</p>
        <Link href="/login?next=/account" className="text-primary font-medium hover:underline">
          Go to sign in
        </Link>
      </div>
    );
  }

  if (!user) return <PageLoader />;

  const firstName = profile?.firstName ?? user.firstName ?? "";
  const lastName = profile?.lastName ?? user.lastName ?? "";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Account</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-medium">{user.email}</span>
            <Badge tone={user.role === "ADMIN" ? "info" : "neutral"}>{user.role}</Badge>
            <Badge tone={user.emailVerified ? "success" : "warning"}>
              {user.emailVerified ? "Email verified" : "Email unverified"}
            </Badge>
            {!user.emailVerified ? (
              <Link href="/verify-email" className="text-primary text-xs underline">
                Verify now
              </Link>
            ) : null}
          </div>

          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveProfile.mutate({ firstName, lastName });
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                maxLength={100}
                onChange={(e) => setProfile({ firstName: e.target.value, lastName })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                maxLength={100}
                onChange={(e) => setProfile({ firstName, lastName: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saveProfile.isPending || profile === null}>
                {saveProfile.isPending ? "Saving…" : "Save changes"}
              </Button>
              {saveProfile.isSuccess ? (
                <span className="text-muted-foreground ml-3 text-sm">Saved.</span>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <AddressBook />
    </div>
  );
}

function AddressBook() {
  const { data: addresses, isLoading } = useAddresses();
  const create = useCreateAddress();
  const remove = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const [form, setForm] = useState<AddressCreateRequest>(EMPTY_ADDRESS);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Addresses</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" aria-hidden />
          Add
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <PageLoader />
        ) : !addresses || addresses.length === 0 ? (
          <p className="text-muted-foreground text-sm">No saved addresses yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {addresses.map((address) => (
              <li key={address.id} className="border-border rounded-lg border p-4 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium">
                    <MapPin className="h-4 w-4" aria-hidden />
                    {address.label ?? "Address"}
                  </span>
                  {address.isDefault ? <Badge tone="info">Default</Badge> : null}
                </div>
                <p className="text-muted-foreground mt-1">
                  {address.recipientName}, {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}, {address.city}{" "}
                  {address.postalCode ?? ""}, {address.country}
                </p>
                <div className="mt-3 flex gap-2">
                  {!address.isDefault ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={setDefault.isPending}
                      onClick={() => setDefault.mutate(address.id)}
                    >
                      <Star className="h-3.5 w-3.5" aria-hidden />
                      Make default
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(address.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {showForm ? (
          <form
            className="border-border grid gap-3 rounded-lg border p-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              create.mutate(form, {
                onSuccess: () => {
                  setForm(EMPTY_ADDRESS);
                  setShowForm(false);
                },
                onError: (err) =>
                  setError(err instanceof Error ? err.message : "Could not save address"),
              });
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-label">Label</Label>
              <Input
                id="addr-label"
                placeholder="Home, Office…"
                value={form.label ?? ""}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-recipient">Recipient</Label>
              <Input
                id="addr-recipient"
                required
                value={form.recipientName}
                onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="addr-line1">Address line 1</Label>
              <Input
                id="addr-line1"
                required
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="addr-line2">Address line 2</Label>
              <Input
                id="addr-line2"
                value={form.line2 ?? ""}
                onChange={(e) => setForm({ ...form, line2: e.target.value || null })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-city">City</Label>
              <Input
                id="addr-city"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-postal">Postal code</Label>
              <Input
                id="addr-postal"
                value={form.postalCode ?? ""}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value || null })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="addr-country">Country code</Label>
              <Input
                id="addr-country"
                required
                maxLength={2}
                placeholder="BD"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase() })}
              />
            </div>
            <label className="flex items-center gap-2 self-end text-sm">
              <input
                type="checkbox"
                checked={form.isDefault ?? false}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              />
              Set as default
            </label>
            {error ? <p className="text-destructive sm:col-span-2 text-sm">{error}</p> : null}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? "Saving…" : "Save address"}
              </Button>
            </div>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
