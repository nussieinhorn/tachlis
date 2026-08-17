"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconLock } from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";

export function PrivateIssueGate({
  issueId,
  issueTitle,
  ownerName,
}: {
  issueId: string;
  issueTitle: string;
  ownerName?: string;
}) {
  const { isSignedIn, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [requestStatus, setRequestStatus] = useState<"pending" | "rejected" | "revoked" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("private_access_requests")
      .select("status")
      .eq("issue_id", issueId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data && data.status !== "approved") setRequestStatus(data.status as "pending" | "rejected" | "revoked");
      });
  }, [user, issueId]);

  async function submitRequest() {
    if (!user) return;
    setError(null);
    const supabase = createClient();
    // A rejected/revoked request already has a row (issue_id, user_id is unique) — re-requesting updates it back to pending.
    const { error: writeError } = requestStatus
      ? await supabase
          .from("private_access_requests")
          .update({ status: "pending", message: message.trim() || null })
          .eq("issue_id", issueId)
          .eq("user_id", user.id)
      : await supabase
          .from("private_access_requests")
          .insert({ issue_id: issueId, user_id: user.id, message: message.trim() || null });
    if (writeError) {
      setError(writeError.message);
      return;
    }
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
          &quot;{issueTitle}&quot; is only visible to people {ownerName ? `${ownerName} has` : "the owner has"}{" "}
          invited. Request access below, or head back home.
        </p>
      </div>

      {!isSignedIn ? (
        <AuthGate
          title="Sign in to request access"
          description="You'll need an account to request access to this private issue."
          onSignedIn={() => router.refresh()}
        />
      ) : submitted || requestStatus === "pending" ? (
        <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          Request sent — you&apos;ll get access once an admin approves it.
        </p>
      ) : (
        <div className="flex w-full max-w-xs flex-col gap-2">
          {(requestStatus === "rejected" || requestStatus === "revoked") && (
            <p className="rounded-lg border border-dashed border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              {requestStatus === "rejected"
                ? "Your last request wasn't approved. You can ask again below."
                : "Your access was revoked. You can request it again below."}
            </p>
          )}
          <Input type="email" value={email} disabled placeholder="Your email" />
          <Textarea
            placeholder="Why do you need access? (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-16"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="button" onClick={submitRequest}>
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
