"use client";

import { useEffect, useState } from "react";
import { IconBell, IconBellRinging, IconCheck } from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const EVENTS: { type: string; label: string; description: string }[] = [
  { type: "update_posted", label: "Updates from the organizers", description: "Progress, news and what happens next." },
  { type: "solution_suggested", label: "New solutions", description: "When someone proposes a way to fix it." },
  { type: "solution_chosen", label: "A solution is chosen", description: "When the community picks the plan." },
  { type: "status_changed", label: "Status changes", description: "When the issue moves to a new stage." },
];
const ALL_TYPES = EVENTS.map((e) => e.type);

/** A button that opens a pop-up where you choose exactly which alerts you want for this issue. */
export function AlertsSignup({ issueId }: { issueId: string }) {
  const { isSignedIn, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [types, setTypes] = useState<string[]>(ALL_TYPES);
  const [email, setEmail] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscribed(false);
      return;
    }
    createClient()
      .from("issue_alert_subscriptions")
      .select("notify_types, email")
      .eq("issue_id", issueId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setSubscribed(Boolean(data));
        if (data) {
          setTypes(data.notify_types ?? ALL_TYPES);
          setEmail(data.email);
        }
      });
  }, [user, issueId]);

  function toggleType(type: string) {
    setSaved(false);
    setTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: err } =
      types.length === 0
        ? await supabase.from("issue_alert_subscriptions").delete().eq("issue_id", issueId).eq("user_id", user.id)
        : await supabase
            .from("issue_alert_subscriptions")
            .upsert({ issue_id: issueId, user_id: user.id, notify_types: types, email }, { onConflict: "issue_id,user_id" });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSubscribed(types.length > 0);
    setSaved(true);
    setTimeout(() => setOpen(false), 700);
  }

  async function turnOff() {
    if (!user) return;
    setSaving(true);
    await createClient().from("issue_alert_subscriptions").delete().eq("issue_id", issueId).eq("user_id", user.id);
    setSaving(false);
    setSubscribed(false);
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant={subscribed ? "secondary" : "outline"}
        onClick={() => setOpen(true)}
        className="shrink-0"
      >
        <Icon icon={subscribed ? IconBellRinging : IconBell} size={16} />
        {subscribed ? "Alerts on" : "Get alerts"}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSaved(false);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alerts for this issue</DialogTitle>
            <DialogDescription>Choose what you want to hear about. You can change this any time.</DialogDescription>
          </DialogHeader>

          {!isSignedIn ? (
            <AuthGate title="Sign in to get alerts" description="You'll need an account so we know where to send them." />
          ) : (
            <div className="flex flex-col gap-5">
              <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
                {EVENTS.map((e) => (
                  <li key={e.type} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{e.label}</span>
                      <span className="text-xs text-muted-foreground">{e.description}</span>
                    </div>
                    <Switch checked={types.includes(e.type)} onCheckedChange={() => toggleType(e.type)} />
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/60 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Also email me</span>
                  <span className="text-xs text-muted-foreground">Sent to {user?.email}</span>
                </div>
                <Switch checked={email} onCheckedChange={(v) => { setEmail(v); setSaved(false); }} />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex items-center justify-between gap-2">
                {subscribed ? (
                  <Button type="button" variant="ghost" size="sm" onClick={turnOff} disabled={saving}>
                    Turn off alerts
                  </Button>
                ) : (
                  <span />
                )}
                <Button type="button" onClick={save} disabled={saving}>
                  {saved ? (
                    <>
                      <Icon icon={IconCheck} size={16} /> Saved
                    </>
                  ) : types.length === 0 ? (
                    "Save (no alerts)"
                  ) : subscribed ? (
                    "Save changes"
                  ) : (
                    "Turn on alerts"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
