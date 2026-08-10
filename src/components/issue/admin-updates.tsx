"use client";

import { useState } from "react";
import { IconSpeakerphone } from "@tabler/icons-react";

import type { Update } from "@/lib/mock-data";
import { useAdminMode } from "@/lib/admin-mode";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { AlertsSignup } from "@/components/issue/alerts-signup";

const PAGE_SIZE = 10;

export function AdminUpdates({ initialUpdates }: { initialUpdates: Update[] }) {
  const { isAdmin } = useAdminMode();
  const [updates, setUpdates] = useState(initialUpdates);
  const [draft, setDraft] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  function post() {
    if (!draft.trim()) return;
    // TODO(supabase): onPostUpdate({ issueId, body: draft })
    setUpdates((prev) => [{ date: "Just now", body: draft.trim() }, ...prev]);
    setDraft("");
  }

  const visible = updates.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-4">
      <AlertsSignup />

      {isAdmin && (
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-primary/40 bg-accent/40 p-3">
          <Textarea
            placeholder="Post an update as the admin..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-16 bg-background"
          />
          <Button size="sm" className="w-fit" onClick={post} disabled={!draft.trim()}>
            Post update
          </Button>
        </div>
      )}

      {updates.length === 0 ? (
        <p className="text-sm text-muted-foreground">No updates posted yet.</p>
      ) : (
        <>
          <ul className="flex flex-col gap-2.5">
            {visible.map((update, i) => (
              <li
                key={`${update.date}-${i}`}
                className="flex gap-2.5 rounded-lg bg-accent/30 px-3 py-2.5"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon icon={IconSpeakerphone} size={13} />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm leading-snug font-medium text-foreground">
                    {update.body}
                  </span>
                  <span className="text-xs text-muted-foreground">{update.date}</span>
                </div>
              </li>
            ))}
          </ul>
          {visibleCount < updates.length && (
            <Button
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              Load more
            </Button>
          )}
        </>
      )}
    </div>
  );
}
