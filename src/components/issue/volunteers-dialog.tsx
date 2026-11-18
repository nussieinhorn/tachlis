"use client";

import { useState } from "react";
import { IconHandLoveYou } from "@tabler/icons-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Volunteer = { name: string | null; email: string | null; phone: string | null; createdAt: string };

/** For the issue's organizers: the contact details people left when they offered to help. Nobody else can read these. */
export function VolunteersDialog({ issueId, count }: { issueId: string; count: number }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Volunteer[] | null>(null);

  async function load() {
    const { data } = await createClient()
      .from("issue_support_contacts")
      .select("name, email, phone, created_at, support:issue_supports!inner(issue_id)")
      .eq("support.issue_id", issueId)
      .order("created_at", { ascending: false });
    setRows((data ?? []).map((r) => ({ name: r.name, email: r.email, phone: r.phone, createdAt: r.created_at })));
  }

  if (count === 0) return null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => {
          setOpen(true);
          load();
        }}
      >
        <span className="flex items-center gap-2">
          <Icon icon={IconHandLoveYou} size={16} />
          People who offered to help
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold tabular-nums">{count}</span>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>People who offered to help</DialogTitle>
            <DialogDescription>Only you and the issue's other organizers can see these contact details.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {rows === null ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nobody has left contact details yet.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
                {rows.map((r, i) => (
                  <li key={i} className="flex flex-col gap-0.5 px-4 py-3 text-sm">
                    <span className="font-semibold">{r.name || "Unnamed"}</span>
                    {r.email && (
                      <a className="text-primary hover:underline" href={`mailto:${r.email}`}>
                        {r.email}
                      </a>
                    )}
                    {r.phone && (
                      <a className="text-muted-foreground hover:underline" href={`tel:${r.phone}`}>
                        {r.phone}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
