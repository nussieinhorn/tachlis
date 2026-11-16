"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconSpeakerphone } from "@tabler/icons-react";

import type { Update } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { AlertsSignup } from "@/components/issue/alerts-signup";

const PAGE_SIZE = 5;
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

  async function post() {
    if (!draft.trim() || !user || submitting) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("issue_updates")
      .insert({ issue_id: issueId, author_id: user.id, title: title.trim() || null, body: draft.trim() });
    setSubmitting(false);
    if (error) return;
    setUpdates((prev) => [
      { date: "Just now", body: draft.trim(), title: title.trim() || undefined, at: new Date().toISOString() },
      ...prev,
    ]);
    setTitle("");
    setDraft("");
    router.refresh();
  }

  const visible = updates.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="type-panel">Updates</h2>
        <AlertsSignup issueId={issueId} />
      </div>

      {canEdit && (
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-primary/40 bg-accent/40 p-3">
          <Input
            placeholder="Headline (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background font-semibold"
          />
          <Textarea
            placeholder="Share progress with everyone following this issue..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-20 bg-background"
          />
          <Button size="sm" className="w-fit" onClick={post} disabled={!draft.trim() || submitting}>
            {submitting ? "Posting..." : "Post update"}
          </Button>
        </div>
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
                      {isNew && (
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase">
                          New
                        </span>
                      )}
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
