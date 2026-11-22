"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { authApi } from "@/lib/api";
import { authErrorMessage } from "@/lib/auth/errors";

/** Email verification: request a code, then confirm the 6-digit code. */
export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [requesting, setRequesting] = useState(false);

  async function requestCode() {
    setError(null);
    setNotice(null);
    setRequesting(true);
    try {
      await authApi.requestEmailVerification();
      setNotice("A verification code is on its way to your inbox.");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setRequesting(false);
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await authApi.confirmEmail({ code });
      router.push("/account");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Enter the 6-digit code we emailed you"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="text-center font-mono text-lg tracking-[0.5em]"
          />
        </div>
        {error ? (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : null}
        {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
        <Button type="submit" disabled={pending || code.length !== 6} size="lg">
          {pending ? <Spinner className="h-4 w-4" /> : null}
          Confirm
        </Button>
        <Button type="button" variant="ghost" onClick={requestCode} disabled={requesting}>
          {requesting ? <Spinner className="h-4 w-4" /> : null}
          Resend code
        </Button>
      </form>
    </AuthShell>
  );
}
