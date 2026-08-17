"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconLock, IconPlus, IconUsersGroup, IconWorld, IconX } from "@tabler/icons-react";

import {
  COMMUNITY_TONE_CLASSES,
  type Community,
  type CommunityTone,
} from "@/lib/communities-data";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { LocationSearch } from "@/components/location-search";
import { isValidEmail } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateIssueDialog } from "@/components/issue/create-issue-dialog";

const TONES: CommunityTone[] = ["coral", "amber", "blue", "violet", "green", "slate"];
const STEPS = ["Privacy", "Basics", "Invite"];

type Invite = { id: string; name: string; email: string };

export function CreateCommunityDialog({
  trigger,
  editCommunity,
  quickMode,
  onCreated,
  defaultPrivacy,
}: {
  trigger: ReactNode;
  editCommunity?: Community;
  /** Skips the Invite step and confirmation screen — used from inside the Create Issue wizard. */
  quickMode?: boolean;
  onCreated?: (community: Community) => void;
  defaultPrivacy?: "public" | "private";
}) {
  const isEditing = Boolean(editCommunity);
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [showFirstIssuePrompt, setShowFirstIssuePrompt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | undefined>(undefined);

  const [name, setName] = useState(editCommunity?.name ?? "");
  const [description, setDescription] = useState(editCommunity?.description ?? "");
  const [location, setLocation] = useState(editCommunity?.location ?? "");
  const [tone, setTone] = useState<CommunityTone>(editCommunity?.tone ?? "coral");
  const [privacy, setPrivacy] = useState<"public" | "private">(editCommunity?.privacy ?? defaultPrivacy ?? "public");
  const [invites, setInvites] = useState<Invite[]>([]);

  function reset(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setStep(0);
      setDone(false);
      setShowFirstIssuePrompt(false);
      setError(null);
      setCreatedId(undefined);
      setName(editCommunity?.name ?? "");
      setDescription(editCommunity?.description ?? "");
      setLocation(editCommunity?.location ?? "");
      setTone(editCommunity?.tone ?? "coral");
      setPrivacy(editCommunity?.privacy ?? "public");
      setInvites([]);
      router.refresh();
    }
  }

  function addInvite() {
    setInvites((prev) => [...prev, { id: `inv-${prev.length}-${Date.now()}`, name: "", email: "" }]);
  }
  function updateInvite(id: string, patch: Partial<Invite>) {
    setInvites((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function removeInvite(id: string) {
    setInvites((prev) => prev.filter((i) => i.id !== id));
  }

  async function finish() {
    if (!user || submitting) return;
    setSubmitting(true);
    setError(null);
    const supabase = createClient();

    if (isEditing && editCommunity) {
      const { error: updateError } = await supabase
        .from("communities")
        .update({ name: name.trim(), description, location, tone, privacy })
        .eq("id", editCommunity.id);
      setSubmitting(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setDone(true);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("communities")
      .insert({ name: name.trim(), description, location, tone, privacy, owner_id: user.id })
      .select()
      .single();
    if (insertError || !data) {
      setSubmitting(false);
      setError(insertError?.message ?? "Something went wrong.");
      return;
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "https://tachlis.org";
    for (const invite of invites) {
      const email = invite.email.trim().toLowerCase();
      if (!email || !isValidEmail(email)) continue;
      const { data: pendingInvite } = await supabase
        .from("pending_invites")
        .insert({ email, resource_type: "community", resource_id: data.id, role: "editor", invited_by: user.id })
        .select("token")
        .single();
      if (pendingInvite) {
        supabase.functions.invoke("send-transactional-email", {
          body: {
            type: "invite",
            to: email,
            data: { resourceTitle: name.trim(), resourceType: "community", role: "editor", link: `${origin}/invite/accept?token=${pendingInvite.token}` },
          },
        }).catch(() => {});
      }
    }

    setSubmitting(false);
    setCreatedId(data.id);

    if (quickMode) {
      const created: Community = {
        id: data.id,
        displayCode: data.display_code,
        name: data.name,
        description: data.description ?? "",
        location: data.location ?? "",
        privacy: data.privacy as Community["privacy"],
        memberCount: 0,
        tone: data.tone as CommunityTone,
        ownerId: data.owner_id ?? undefined,
      };
      onCreated?.(created);
      reset(false);
      return;
    }
    setDone(true);
  }

  const singlePage = isEditing || quickMode;
  const canAdvance = step === 1 ? name.trim().length > 0 : true;

  return (
    <Dialog open={open} onOpenChange={reset}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-lg">
        {!user ? (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">Sign in</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <AuthGate
                title="Sign in to create a community"
                description="You'll need an account to create and manage a community."
              />
            </div>
          </>
        ) : done ? (
          showFirstIssuePrompt && createdId ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-status-resolved/15 text-status-resolved">
                <Icon icon={IconCheck} size={28} />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">Community created!</DialogTitle>
              </DialogHeader>
              <p className="max-w-sm text-sm text-muted-foreground">
                Want to start with your first issue in {name}?
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => reset(false)}>
                  Not now
                </Button>
                <CreateIssueDialog
                  lockedCommunityId={createdId}
                  trigger={<Button onClick={() => reset(false)}>Create first issue</Button>}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-status-resolved/15 text-status-resolved">
                <Icon icon={IconCheck} size={28} />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">
                  {isEditing ? "Changes saved!" : "Community created!"}
                </DialogTitle>
              </DialogHeader>
              {!isEditing && (
                <Button onClick={() => setShowFirstIssuePrompt(true)}>Continue</Button>
              )}
              {isEditing && <Button onClick={() => reset(false)}>Done</Button>}
            </div>
          )
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit community" : quickMode ? "Create a new community" : STEPS[step]}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-1">
              {step === 0 && !singlePage && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(
                    [
                      {
                        value: "public" as const,
                        icon: IconWorld,
                        title: "Public",
                        points: [
                          { ok: true, text: "Searchable on Tachlis" },
                          { ok: true, text: "Can be customized and appear on the homepage" },
                          { ok: true, text: "Anyone with the link can view and support it" },
                        ],
                      },
                      {
                        value: "private" as const,
                        icon: IconLock,
                        title: "Private",
                        points: [
                          { ok: false, text: "Not searchable, not on the homepage" },
                          { ok: false, text: "No one can view or join uninvited" },
                          { ok: true, text: "Only people you invite or approve can join" },
                        ],
                      },
                    ]
                  ).map((opt) => (
                    <div
                      key={opt.value}
                      className={cn(
                        "flex flex-col gap-3 rounded-xl border-2 p-5 transition-colors",
                        privacy === opt.value ? "border-primary bg-accent/40" : "border-border",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon icon={opt.icon} size={22} className="text-foreground" />
                        <span className="font-heading text-lg font-semibold text-foreground">{opt.title}</span>
                      </div>
                      <ul className="flex flex-col gap-1.5">
                        {opt.points.map((p) => (
                          <li key={p.text} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Icon
                              icon={p.ok ? IconCheck : IconX}
                              size={15}
                              className={cn("mt-0.5 shrink-0", p.ok ? "text-status-resolved" : "text-destructive")}
                            />
                            {p.text}
                          </li>
                        ))}
                      </ul>
                      <Button
                        type="button"
                        variant={privacy === opt.value ? "default" : "outline"}
                        className="mt-auto"
                        onClick={() => {
                          setPrivacy(opt.value);
                          setStep(1);
                        }}
                      >
                        Continue
                      </Button>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    You can change this later.
                  </p>
                </div>
              )}

              {(step === 1 || singlePage) && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="community-name">Community name</Label>
                    <Input
                      id="community-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Cedar Park Residents Association"
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="community-description">Description</Label>
                    <Textarea
                      id="community-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What's this community about?"
                      className="min-h-16"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="community-location">Location</Label>
                    <LocationSearch value={location} onChange={setLocation} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Logo</Label>
                    <div className="flex gap-2">
                      {TONES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTone(t)}
                          className={cn(
                            "flex size-11 items-center justify-center rounded-full text-white ring-offset-2 transition-shadow",
                            COMMUNITY_TONE_CLASSES[t],
                            tone === t && "ring-2 ring-primary",
                          )}
                        >
                          {tone === t ? <Icon icon={IconCheck} size={18} /> : <Icon icon={IconUsersGroup} size={18} />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Privacy</Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPrivacy("public")}
                        className={cn(
                          "flex-1 rounded-md border px-3 py-2 text-sm",
                          privacy === "public" ? "border-primary bg-accent" : "border-input",
                        )}
                      >
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrivacy("private")}
                        className={cn(
                          "flex-1 rounded-md border px-3 py-2 text-sm",
                          privacy === "private" ? "border-primary bg-accent" : "border-input",
                        )}
                      >
                        Private
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && !singlePage && (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    Invite people to join {name || "this community"}.
                  </p>
                  {invites.map((invite) => (
                    <div key={invite.id} className="flex items-center gap-2">
                      <Input
                        placeholder="Name"
                        value={invite.name}
                        onChange={(e) => updateInvite(invite.id, { name: e.target.value })}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={invite.email}
                        onChange={(e) => updateInvite(invite.id, { email: e.target.value })}
                      />
                      <button type="button" onClick={() => removeInvite(invite.id)} aria-label="Remove">
                        <Icon icon={IconX} size={14} className="text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-fit" onClick={addInvite}>
                    <Icon icon={IconPlus} size={16} />
                    Invite someone
                  </Button>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex items-center justify-between border-t border-border pt-3">
              {!singlePage && step > 0 ? (
                <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)}>
                  Back
                </Button>
              ) : (
                <span />
              )}
              {!singlePage && step < STEPS.length - 1 ? (
                <Button size="sm" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
                  Next
                </Button>
              ) : (
                <Button size="sm" onClick={finish} disabled={!canAdvance || submitting}>
                  {submitting ? "Saving..." : isEditing ? "Save changes" : "Create community"}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
