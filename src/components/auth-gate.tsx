"use client";

import { useState } from "react";
import { IconMailCheck } from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AuthGate({
  title = "Sign in to continue",
  description = "You'll need an account to continue.",
  onSignedIn,
}: {
  title?: string;
  description?: string;
  onSignedIn?: () => void;
}) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [mode, setMode] = useState<"form" | "forgot">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const canSubmit = email.trim() && password.trim() && (tab === "signin" || name.trim());

  async function submit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError(null);
    const result =
      tab === "signin"
        ? await signIn(email.trim(), password, rememberMe)
        : await signUp(name.trim(), email.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (tab === "signup") {
      setConfirmSent(true);
    } else {
      onSignedIn?.();
    }
  }

  async function submitForgotPassword() {
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await resetPassword(email.trim());
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setResetSent(true);
  }

  if (confirmSent) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-status-resolved/15 text-status-resolved">
          <Icon icon={IconMailCheck} size={22} />
        </div>
        <h2 className="font-heading text-lg font-semibold text-foreground">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click it to
          activate your account, then come back and sign in.
        </p>
      </div>
    );
  }

  if (mode === "forgot") {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="font-heading text-lg font-semibold text-foreground">Reset your password</h2>
          <p className="text-sm text-muted-foreground">We'll email you a link to set a new one.</p>
        </div>
        {resetSent ? (
          <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
            Check <strong className="text-foreground">{email}</strong> for a reset link.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="button" disabled={!email.trim() || submitting} onClick={submitForgotPassword}>
              {submitting ? "Sending..." : "Send reset link"}
            </Button>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            setMode("form");
            setResetSent(false);
            setError(null);
          }}
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as "signin" | "signup");
          setError(null);
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Sign up</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="mt-4 flex flex-col gap-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-input accent-primary"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => {
                setMode("forgot");
                setError(null);
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="button" disabled={!canSubmit || submitting} onClick={submit}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </TabsContent>

        <TabsContent value="signup" className="mt-4 flex flex-col gap-3">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="button" disabled={!canSubmit || submitting} onClick={submit}>
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
