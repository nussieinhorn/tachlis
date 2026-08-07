"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { IconArrowLeft, IconLock } from "@tabler/icons-react";

import { useAdminMode } from "@/lib/admin-mode";
import { useFakeSession } from "@/lib/fake-session";
import { usePrivateAccess } from "@/lib/private-access";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";

export function PrivateIssueGate({
  issueId,
  issueTitle,
  children,
}: {
  issueId: string;
  issueTitle: string;
  children: ReactNode;
}) {
  const { isAdmin } = useAdminMode();
  const { user } = useFakeSession();
  const { hasAccess } = usePrivateAccess();

  const granted = isAdmin || hasAccess(issueId, user?.email);
  if (granted) return <>{children}</>;

  return <PrivateIssueGateScreen issueId={issueId} issueTitle={issueTitle} />;
}

function PrivateIssueGateScreen({ issueId, issueTitle }: { issueId: string; issueTitle: string }) {
  const { isSignedIn, user } = useFakeSession();
  const { hasPendingRequest, requestAccess } = usePrivateAccess();
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  const alreadyPending = hasPendingRequest(issueId, user?.email);

  function submitRequest() {
    if (!user || !email.trim()) return;
    requestAccess(issueId, user.name, email.trim());
    setSubmitted(true);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-6 py-20 text-center">
      <span className="font-heading text-xl font-bold text-foreground">Tachlis</span>

      <div className="flex flex-col items-center gap-2">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Icon icon={IconLock} size={22} className="text-muted-foreground" />
        </div>
        <h1 className="font-heading text-xl font-semibold text-foreground">This issue is private</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          &quot;{issueTitle}&quot; is only visible to approved members. Request access below, or head back
          home.
        </p>
      </div>

      {!isSignedIn ? (
        <AuthGate
          title="Sign in to request access"
          description="You'll need an account to request access to this private issue."
        />
      ) : submitted || alreadyPending ? (
        <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          Request sent — you&apos;ll get access once an admin approves it.
        </p>
      ) : (
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
          />
          <Button type="button" onClick={submitRequest} disabled={!email.trim()}>
            Request access
          </Button>
        </div>
      )}

      <Link
        href="/"
        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <Icon icon={IconArrowLeft} size={16} />
        Back to homepage
      </Link>
    </main>
  );
}
