"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconX } from "@tabler/icons-react";

import { ISSUE_STATUSES, StatusBadge, type IssueStatus } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { SettingRow } from "@/components/issue/setting-row";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function ChosenSolutionDialog({
  open,
  onOpenChange,
  issueId,
  solutionId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string;
  solutionId: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<IssueStatus>("solution-chosen");
  const [tasks, setTasks] = useState<string[]>([]);
  const [newTask, setNewTask] = useState("");
  const [showToSupporters, setShowToSupporters] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function addTask() {
    if (!newTask.trim()) return;
    setTasks((prev) => [...prev, newTask.trim()]);
    setNewTask("");
  }

  function removeTask(i: number) {
    setTasks((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function confirm() {
    if (submitting) return;
    setSubmitting(true);
    const supabase = createClient();

    await supabase.from("solutions").update({ status: "chosen", is_chosen: true }).eq("id", solutionId);
    await supabase
      .from("issues")
      .update({ status, first_chosen_prompted_at: new Date().toISOString(), action_plan_visible: showToSupporters })
      .eq("id", issueId);

    const { data: plan } = await supabase
      .from("action_plans")
      .insert({ issue_id: issueId })
      .select()
      .single();
    if (plan && tasks.length > 0) {
      await supabase
        .from("action_tasks")
        .insert(tasks.map((title, i) => ({ action_plan_id: plan.id, title, sort_order: i })));
    }

    setSubmitting(false);
    setStatus("solution-chosen");
    setTasks([]);
    setShowToSupporters(false);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>This is the first solution chosen on this issue</DialogTitle>
          <DialogDescription>
            Pick the issue&apos;s new status, and optionally start the Action Plan&apos;s task list now — you
            can always add more later.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Issue status</Label>
            <div className="flex flex-wrap gap-2">
              {ISSUE_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className="rounded-full"
                  style={{ opacity: status === s ? 1 : 0.5 }}
                >
                  <StatusBadge status={s} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Action Plan tasks (optional)</Label>
            {tasks.map((title, i) => (
              <div key={i} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
                {title}
                <button type="button" onClick={() => removeTask(i)} aria-label="Remove">
                  <Icon icon={IconX} size={14} className="text-muted-foreground" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTask())}
                placeholder="e.g. Sign lease for adjacent space"
                className="h-9 text-sm"
              />
              <button
                type="button"
                onClick={addTask}
                aria-label="Add task"
                className="flex size-9 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Icon icon={IconPlus} size={16} />
              </button>
            </div>
          </div>

          <SettingRow
            label="Show the Action Plan to supporters now"
            description="You can always prepare tasks privately first and turn this on later from the Action Plan card."
            checked={showToSupporters}
            onChange={setShowToSupporters}
          />
        </div>

        <DialogFooter>
          <Button onClick={confirm} disabled={submitting}>
            {submitting ? "Saving..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
