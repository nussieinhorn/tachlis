"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconChevronDown, IconX } from "@tabler/icons-react";

import type { Solution, SolutionStatus } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";

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
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  isFirstChosen,
  onRequestChosenFlow,
}: {
  solution: Solution;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Whether marking this issue's solution "Chosen" would be the first time ever on this issue. */
  isFirstChosen?: boolean;
  /** Called instead of a plain save when the status changes to "chosen" for the first time — the caller should open ChosenSolutionDialog. */
  onRequestChosenFlow?: () => void;
}) {
  const router = useRouter();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const [title, setTitle] = useState(solution.title);
  const [description, setDescription] = useState(solution.description);
  const [status, setStatus] = useState<SolutionStatus>(solution.status);
  const [pros, setPros] = useState<string[]>(solution.pros);
  const [cons, setCons] = useState<string[]>(solution.cons);
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function reset(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTitle(solution.title);
      setDescription(solution.description);
      setStatus(solution.status);
      setPros(solution.pros);
      setCons(solution.cons);
      setNewPro("");
      setNewCon("");
    }
  }

  async function save() {
    if (submitting) return;
    // Marking "chosen" for the first time ever on this issue needs the same popup as the card's
    // own status dropdown (sets issues.first_chosen_prompted_at, creates the Action Plan) — a plain
    // status update here would silently skip that activation entirely.
    const becomingFirstChosen = status === "chosen" && solution.status !== "chosen" && Boolean(isFirstChosen);
    setSubmitting(true);
    const supabase = createClient();
    await supabase
      .from("solutions")
      .update({
        title: title.trim(),
        description: description.trim(),
        pros,
        cons,
        ...(becomingFirstChosen ? {} : { status, is_chosen: status === "chosen" }),
      })
      .eq("id", solution.id);
    setSubmitting(false);
    setOpen(false);
    if (becomingFirstChosen) {
      onRequestChosenFlow?.();
    } else {
      router.refresh();
    }
  }

  const statusLabel = STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;

  return (
    <Dialog open={open} onOpenChange={reset}>
      {trigger && <span onClick={() => setOpen(true)}>{trigger}</span>}
      <DialogContent className="max-h-[85vh] overflow-y-auto">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-fit items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent"
                >
                  {statusLabel}
                  <Icon icon={IconChevronDown} size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {STATUS_OPTIONS.map((opt) => (
                  <DropdownMenuItem key={opt.value} onClick={() => setStatus(opt.value)}>
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Pros</Label>
              {pros.map((pro, i) => (
                <div
                  key={`${pro}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-status-resolved/10 px-3 py-1.5 text-sm"
                >
                  {pro}
                  <button
                    type="button"
                    onClick={() => setPros((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label="Remove"
                  >
                    <Icon icon={IconX} size={14} className="text-muted-foreground" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <Input
                  value={newPro}
                  onChange={(e) => setNewPro(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" || !newPro.trim()) return;
                    e.preventDefault();
                    setPros((prev) => [...prev, newPro.trim()]);
                    setNewPro("");
                  }}
                  placeholder="Add a pro..."
                  className="h-8 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newPro.trim()) return;
                    setPros((prev) => [...prev, newPro.trim()]);
                    setNewPro("");
                  }}
                  aria-label="Add pro"
                  className="flex size-8 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon icon={IconCheck} size={14} />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Cons</Label>
              {cons.map((con, i) => (
                <div
                  key={`${con}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-sm"
                >
                  {con}
                  <button
                    type="button"
                    onClick={() => setCons((prev) => prev.filter((_, idx) => idx !== i))}
                    aria-label="Remove"
                  >
                    <Icon icon={IconX} size={14} className="text-muted-foreground" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <Input
                  value={newCon}
                  onChange={(e) => setNewCon(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" || !newCon.trim()) return;
                    e.preventDefault();
                    setCons((prev) => [...prev, newCon.trim()]);
                    setNewCon("");
                  }}
                  placeholder="Add a con..."
                  className="h-8 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newCon.trim()) return;
                    setCons((prev) => [...prev, newCon.trim()]);
                    setNewCon("");
                  }}
                  aria-label="Add con"
                  className="flex size-8 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon icon={IconCheck} size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={!title.trim() || !description.trim() || submitting}>
            {submitting ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
