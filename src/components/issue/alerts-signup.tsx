"use client";

import { useEffect, useRef, useState } from "react";
import { IconBellRinging } from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { AuthGate } from "@/components/auth-gate";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function AlertsSignup({ issueId }: { issueId: string }) {
  const { isSignedIn, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const wasSignedIn = useRef(isSignedIn);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("issue_alert_subscriptions")
      .select("issue_id")
      .eq("issue_id", issueId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setSubscribed(Boolean(data)));
  }, [user, issueId]);

  useEffect(() => {
    wasSignedIn.current = isSignedIn;
  }, [isSignedIn]);

  async function toggle() {
    if (!user) return;
    const supabase = createClient();
    if (subscribed) {
      await supabase.from("issue_alert_subscriptions").delete().eq("issue_id", issueId).eq("user_id", user.id);
      setSubscribed(false);
    } else {
      await supabase.from("issue_alert_subscriptions").insert({ issue_id: issueId, user_id: user.id });
      setSubscribed(true);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <Icon icon={IconBellRinging} size={14} />
        Sign up for alerts
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Get alerts for this issue</DialogTitle>
            <DialogDescription>We&apos;ll email you when there&apos;s a new update.</DialogDescription>
          </DialogHeader>

          {!isSignedIn ? (
            <AuthGate
              title="Sign in to get alerts"
              description="You'll need an account so we know where to send updates."
            />
          ) : (
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={subscribed}
                onChange={toggle}
                className="size-4 rounded border-border"
              />
              {subscribed ? `You'll get updates at ${user?.email}` : "Email me updates on this issue"}
            </label>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
