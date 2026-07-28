"use client";

import { useState } from "react";

import type { Update } from "@/lib/mock-data";
import { useAdminMode } from "@/lib/admin-mode";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AdminUpdates({ initialUpdates }: { initialUpdates: Update[] }) {
  const { isAdmin } = useAdminMode();
  const [updates, setUpdates] = useState(initialUpdates);
  const [draft, setDraft] = useState("");

  function post() {
    if (!draft.trim()) return;
    setUpdates((prev) => [{ date: "Just now", body: draft.trim() }, ...prev]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-4">
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
        <ul className="flex flex-col gap-3">
          {updates.map((update, i) => (
            <li key={`${update.date}-${i}`} className="flex flex-col gap-0.5 border-b border-border pb-3 last:border-0 last:pb-0">
              <span className="text-xs font-medium text-muted-foreground">{update.date}</span>
              <span className="text-sm text-foreground/90">{update.body}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
