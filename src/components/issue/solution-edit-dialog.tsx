"use client";

import { useState, type ReactNode } from "react";

import type { Solution, SolutionStatus } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const STATUS_OPTIONS: { value: SolutionStatus; label: string }[] = [
  { value: "proposed", label: "Proposed" },
  { value: "considering", label: "Considering" },
  { value: "trending", label: "Trending" },
  { value: "chosen", label: "Chosen" },
  { value: "rejected", label: "Rejected" },
];

export function SolutionEditDialog({
  solution,
  trigger,
  onSave,
}: {
  solution: Solution;
  trigger: ReactNode;
  onSave: (patch: Partial<Solution>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(solution.title);
  const [description, setDescription] = useState(solution.description);
  const [status, setStatus] = useState<SolutionStatus>(solution.status);

  function reset(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTitle(solution.title);
      setDescription(solution.description);
      setStatus(solution.status);
    }
  }

  function save() {
    // TODO(supabase): onUpdateSolution({ solutionId: solution.id, title, description, status })
    onSave({ title: title.trim(), description: description.trim(), status });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit solution</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-solution-title">Solution name</Label>
            <Input id="edit-solution-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-solution-description">Description</Label>
            <Textarea
              id="edit-solution-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Status</Label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    status === opt.value
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={!title.trim() || !description.trim()}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
