"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconEye, IconEyeOff, IconRotate, IconTrash, IconX } from "@tabler/icons-react";

import type { Solution } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SettingRow } from "@/components/issue/setting-row";

type PendingSolution = { id: string; title: string; description: string; submitterName: string | null; submitterEmail: string | null };

export function ManageSolutionsDialog({
  issueId,
  solutions,
  trigger,
  showArchivedToUsers,
}: {
  issueId: string;
  solutions: Solution[];
  trigger: ReactNode;
  showArchivedToUsers: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<PendingSolution[]>([]);
  const [archivedVisible, setArchivedVisible] = useState(showArchivedToUsers);

  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    supabase
      .from("solutions")
      .select("id, title, description, submitter:profiles!solutions_submitted_by_fkey(name, email)")
      .eq("issue_id", issueId)
      .eq("review_status", "pending")
      .eq("deleted", false)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setPending(
          (data ?? []).map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description,
            submitterName: (row.submitter as { name: string; email: string } | null)?.name ?? null,
            submitterEmail: (row.submitter as { name: string; email: string } | null)?.email ?? null,
          })),
        );
      });
  }, [open, issueId]);

  async function acceptSolution(id: string) {
    const supabase = createClient();
    await supabase.from("solutions").update({ review_status: "approved", status: "considering" }).eq("id", id);
    setPending((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  }

  async function rejectSolution(id: string) {
    const supabase = createClient();
    await supabase.from("solutions").update({ review_status: "rejected" }).eq("id", id);
    setPending((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  }

  async function toggleShowArchived(checked: boolean) {
    setArchivedVisible(checked);
    const supabase = createClient();
    await supabase.from("issues").update({ show_hidden_solutions_after_chosen: checked }).eq("id", issueId);
    router.refresh();
  }

  async function toggleHide(id: string, hidden: boolean) {
    const supabase = createClient();
    await supabase.from("solutions").update({ hidden: !hidden }).eq("id", id);
    router.refresh();
  }

  async function toggleDelete(id: string, deleted: boolean) {
    const supabase = createClient();
    await supabase.from("solutions").update({ deleted: !deleted }).eq("id", id);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage solutions</DialogTitle>
          <DialogDescription>Review new suggestions, or restore, hide, and delete existing solutions.</DialogDescription>
        </DialogHeader>

        {pending.length > 0 && (
          <div className="flex flex-col gap-2 rounded-lg border border-dashed border-primary/40 bg-accent/30 p-3">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Pending review ({pending.length})
            </span>
            <ul className="flex flex-col divide-y divide-border">
              {pending.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium text-foreground">{p.title}</span>
                    {p.submitterName && (
                      <span className="truncate text-xs text-muted-foreground">
                        {p.submitterName} · {p.submitterEmail}
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => acceptSolution(p.id)}
                      className="rounded p-1.5 text-status-resolved hover:bg-status-resolved/10"
                      aria-label="Accept"
                    >
                      <Icon icon={IconCheck} size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectSolution(p.id)}
                      className="rounded p-1.5 text-destructive hover:bg-destructive/10"
                      aria-label="Reject"
                    >
                      <Icon icon={IconX} size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <SettingRow
          label="Show archived solutions to users"
          description="After one is chosen, let non-admins still see the others."
          checked={archivedVisible}
          onChange={toggleShowArchived}
        />

        <div className="flex-1 overflow-y-auto">
          {solutions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No solutions yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {solutions.map((solution) => (
                <li key={solution.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium text-foreground">{solution.title}</span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {solution.status}
                      </Badge>
                      {solution.deleted && (
                        <Badge variant="destructive" className="text-[10px]">
                          Deleted
                        </Badge>
                      )}
                      {solution.hidden && !solution.deleted && (
                        <Badge variant="secondary" className="text-[10px]">
                          Hidden
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {solution.deleted ? (
                      <Button variant="outline" size="sm" onClick={() => toggleDelete(solution.id, true)}>
                        <Icon icon={IconRotate} size={14} />
                        Restore
                      </Button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => toggleHide(solution.id, Boolean(solution.hidden))}
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          aria-label={solution.hidden ? "Unhide" : "Hide"}
                        >
                          <Icon icon={solution.hidden ? IconEye : IconEyeOff} size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleDelete(solution.id, false)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete"
                        >
                          <Icon icon={IconTrash} size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
