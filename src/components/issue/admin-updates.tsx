"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconDots, IconPencil, IconSpeakerphone, IconTrash } from "@tabler/icons-react";

import type { Update } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertsSignup } from "@/components/issue/alerts-signup";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const PAGE_SIZE = 5;
const HEADLINE_MAX = 80;
const BODY_MAX = 1000;
const DAY = 86_400_000;

const stampMonth = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short" }) : "New");
const stampDay = (iso?: string) => (iso ? new Date(iso).getDate() : "•");
const stampLabel = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Just now";

/** The issue's update timeline: what the organizers have posted, newest first, with a Get alerts button. */
export function AdminUpdates({
  issueId,
  initialUpdates,
  canEdit,
  authorName,
}: {
  issueId: string;
  initialUpdates: Update[];
  canEdit: boolean;
  authorName?: string;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [updates, setUpdates] = useState(initialUpdates);
  const [title, setTitle] = useState("");
  const [draft, setDraft] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // After a refresh the server hands us the saved rows (with ids) — use them.
  useEffect(() => {
    setUpdates(initialUpdates);
  }, [initialUpdates]);

  function startNew() {
    setEditingId(null);
    setTitle("");
    setDraft("");
    setError(null);
    setOpen(true);
  }

  function startEdit(update: Update) {
    setEditingId(update.id ?? null);
    setTitle(update.title ?? "");
    setDraft(update.body);
    setError(null);
    setOpen(true);
  }

  async function removeUpdate(id: string) {
    const { error: deleteError } = await createClient().from("issue_updates").delete().eq("id", id);
    if (deleteError) return;
    setUpdates((prev) => prev.filter((u) => u.id !== id));
    router.refresh();
  }

  async function post() {
    if (!title.trim() || !draft.trim() || !user || submitting) return;
    setSubmitting(true);
    const supabase = createClient();
    if (editingId) {
      const { error: saveError } = await supabase
        .from("issue_updates")
        .update({ title: title.trim(), body: draft.trim() })
        .eq("id", editingId);
      setSubmitting(false);
      if (saveError) {
        setError(saveError.message);
        return;
      }
      setUpdates((prev) => prev.map((u) => (u.id === editingId ? { ...u, title: title.trim(), body: draft.trim() } : u)));
    } else {
      const { data: created, error: insertError } = await supabase
        .from("issue_updates")
        .insert({ issue_id: issueId, author_id: user.id, title: title.trim() || null, body: draft.trim() })
        .select("id")
        .single();
      setSubmitting(false);
      if (insertError) {
        setError(insertError.message);
        return;
      }
      setUpdates((prev) => [
        { id: created?.id, date: "Just now", body: draft.trim(), title: title.trim() || undefined, at: new Date().toISOString() },
        ...prev,
      ]);
    }
    setEditingId(null);
    setTitle("");
    setDraft("");
    setOpen(false);
    router.refresh();
  }

  const visible = updates.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="type-panel">Updates</h2>
        {canEdit ? (
          <Button type="button" variant="outline" onClick={startNew}>
            <Icon icon={IconSpeakerphone} size={16} />
            New Update
          </Button>
        ) : (
          <AlertsSignup issueId={issueId} />
        )}
      </div>

      {canEdit && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit update" : "Post an official update"}</DialogTitle>
              <DialogDescription>
                This is published on the issue&apos;s public timeline and sent to everyone following it
                {authorName ? `, from ${authorName}` : ""}. Keep it clear and factual.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="alert-headline">Headline</Label>
                <Input
                  id="alert-headline"
                  placeholder="e.g. Board meeting date confirmed"
                  value={title}
                  maxLength={HEADLINE_MAX}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="alert-message">Message</Label>
                <Textarea
                  id="alert-message"
                  placeholder="What should everyone following this issue know?"
                  value={draft}
                  maxLength={BODY_MAX}
                  onChange={(e) => setDraft(e.target.value)}
                  className="min-h-32"
                />
                <span className="self-end text-xs tabular-nums text-muted-foreground">
                  {draft.length}/{BODY_MAX}
                </span>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={post} disabled={!title.trim() || !draft.trim() || submitting}>
                {submitting ? (editingId ? "Saving..." : "Publishing...") : editingId ? "Save changes" : "Publish update"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {updates.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon icon={IconSpeakerphone} size={18} />
          </span>
          <p className="text-sm font-semibold">No updates yet</p>
          <p className="text-xs text-muted-foreground">Get alerts and you&apos;ll hear as soon as there&apos;s news.</p>
        </div>
      ) : (
        <>
          <ol className="relative flex flex-col gap-5 before:absolute before:top-4 before:bottom-4 before:left-[16px] before:w-px before:bg-border">
            {visible.map((update, i) => {
              const isNew = update.at ? Date.now() - new Date(update.at).getTime() < 3 * DAY : false;
              return (
                <li key={`${update.at ?? update.date}-${i}`} className="relative pl-11">
                  {/* Date stamp on the timeline */}
                  <span
                    className={`absolute top-0 left-0 flex w-8 flex-col items-center overflow-hidden rounded-md border bg-card text-center ${
                      i === 0 ? "border-primary/50" : "border-border"
                    }`}
                    aria-label={stampLabel(update.at)}
                  >
                    <span
                      className={`w-full py-px text-[8px] leading-tight font-bold tracking-wider uppercase ${
                        i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {stampMonth(update.at)}
                    </span>
                    <span className="font-heading py-0.5 text-sm leading-none font-black tabular-nums">{stampDay(update.at)}</span>
                  </span>
                  <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="type-label leading-snug">{update.title ?? "Update"}</h3>
                      <div className="flex shrink-0 items-center gap-1">
                        {isNew && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase">
                            New
                          </span>
                        )}
                        {canEdit && update.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                aria-label="Update options"
                                className="-mt-1 -mr-1.5 flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                <Icon icon={IconDots} size={16} />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => startEdit(update)}>
                                <Icon icon={IconPencil} size={16} />
                                Edit
                              </DropdownMenuItem>
                              <ConfirmDialog
                                title="Delete this update?"
                                description="It will be removed from the timeline for everyone. This can't be undone."
                                onConfirm={() => removeUpdate(update.id!)}
                                trigger={
                                  <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                                    <Icon icon={IconTrash} size={16} />
                                    Delete
                                  </DropdownMenuItem>
                                }
                              />
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{update.body}</p>
                    <p className="text-xs text-muted-foreground/80">
                      {update.date}
                      {authorName ? ` · ${authorName}` : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
          {visibleCount < updates.length && (
            <Button variant="ghost" size="sm" className="w-fit" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
              Show earlier updates ({updates.length - visibleCount})
            </Button>
          )}
        </>
      )}
    </div>
  );
}
