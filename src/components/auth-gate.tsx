"use client";

import { useState } from "react";

import { useAuth } from "@/lib/auth";
import { isValidEmail } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Passwordless sign-in: enter an email, get a one-time code, type it in. Same flow creates the account the first time. */
export function AuthGate({
  title = "Sign in to continue",
  description = "Enter your email and we'll send you a code. No password needed.",
  onSignedIn,
}: {
  title?: string;
  description?: string;
  onSignedIn?: () => void;
}) {
  const { sendCode, verifyCode } = useAuth();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function requestCode() {
    if (!isValidEmail(email) || submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await sendCode(email, name);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setStep("code");
  }

  async function submitCode(value = code) {
    if (value.length < 6 || submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await verifyCode(email, value);
    setSubmitting(false);
    if (result.error) {
      setError("That code didn't work. Check it and try again, or ask for a new one.");
      return;
    }
    onSignedIn?.();
  }

  async function resend() {
    setError(null);
    setResent(false);
    const result = await sendCode(email, name);
    if (result.error) setError(result.error);
    else setResent(true);
  }

  if (step === "code") {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-7">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="font-heading text-3xl font-black tracking-tight text-foreground">Enter your code</h2>
          <p className="text-sm text-muted-foreground">
            We sent a code to <strong className="text-foreground">{email.trim()}</strong>.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            placeholder="Code"
            maxLength={10}
            value={code}
            className="text-center text-lg tracking-[0.3em]"
            onChange={(e) => {
              const next = e.target.value.replace(/\D/g, "");
              setCode(next);
              if (next.length === 6) submitCode(next);
            }}
            onKeyDown={(e) => e.key === "Enter" && submitCode()}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {resent && <p className="text-sm text-muted-foreground">A new code is on its way.</p>}
          <Button type="button" disabled={code.length < 6 || submitting} onClick={() => submitCode()}>
            {submitting ? "Checking..." : "Sign in"}
          </Button>
        </div>
        <div className="flex items-center justify-center gap-4 text-sm">
          <button type="button" onClick={resend} className="font-medium text-primary hover:underline">
            Send a new code
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
              setResent(false);
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-7">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="font-heading text-3xl font-black tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Input
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && requestCode()}
        />
        <Input
          placeholder="Your name (only needed the first time)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && requestCode()}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="button" disabled={!isValidEmail(email) || submitting} onClick={requestCode}>
          {submitting ? "Sending..." : "Email me a code"}
        </Button>
      </div>
    </div>
  );
}
