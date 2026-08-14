"use client";

import { useEffect, useRef, useState } from "react";
import { IconBellRinging } from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import { AuthGate } from "@/components/auth-gate";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function AlertsSignup() {
  const { isSignedIn, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const wasSignedIn = useRef(isSignedIn);

  useEffect(() => {
    if (open && !wasSignedIn.current && isSignedIn) {
      setSubscribed(true);
    }
    wasSignedIn.current = isSignedIn;
  }, [isSignedIn, open]);

  function toggle() {
    // TODO(supabase): onSubscribeToIssueAlerts({ issueId, email: user?.email })
    setSubscribed((v) => !v);
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
