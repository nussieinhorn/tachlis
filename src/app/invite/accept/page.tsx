"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconCheck, IconX } from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { AuthGate } from "@/components/auth-gate";
import { SiteHeader } from "@/components/site-header";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

function AcceptInvite() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"pending" | "done" | "error">("pending");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn || !token || status !== "pending") return;
    const supabase = createClient();
    supabase.rpc("accept_pending_invite", { p_token: token }).then(({ data, error }) => {
      if (error || !data?.[0]) {
        setErrorMessage(error?.message ?? "This invite is no longer valid.");
        setStatus("error");
        return;
      }
      const row = data[0];
      setStatus("done");
      const path = row.resource_type === "community" ? "communities" : "issues";
      setTimeout(() => router.push(`/${path}/${row.display_code}`), 1200);
    });
  }, [isSignedIn, token, status, router]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-6 py-20 text-center">
      {!token ? (
        <p className="text-sm text-muted-foreground">This invite link is missing its token.</p>
      ) : !isSignedIn ? (
        <AuthGate
          title="Sign in to accept this invite"
          description="Sign in with the email address the invite was sent to."
          onSignedIn={() => setStatus("pending")}
        />
      ) : status === "pending" ? (
        <p className="text-sm text-muted-foreground">Accepting your invite...</p>
      ) : status === "done" ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-status-resolved/15 text-status-resolved">
            <Icon icon={IconCheck} size={24} />
          </div>
          <p className="text-sm text-muted-foreground">Access granted — taking you there now.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <Icon icon={IconX} size={24} />
          </div>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to homepage
          </Button>
        </div>
      )}
    </main>
  );
}

export default function AcceptInvitePage() {
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <main className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-6 py-20 text-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </main>
        }
      >
        <AcceptInvite />
      </Suspense>
    </>
  );
}
