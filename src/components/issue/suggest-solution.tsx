"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconPlus, IconSparkles, IconX } from "@tabler/icons-react";

import type { SolutionStatus } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";

type ProConItem = { id: string; text: string; source: "ai" | "manual" };

// Placeholder heuristic — swap for a real generation call once there's a backend.
function generatePlaceholderProsCons(title: string): { pros: string[]; cons: string[] } {
  const subject = title.trim() || "this solution";
  return {
    pros: [`Directly addresses "${subject}"`, "Could be organized largely by volunteers"],
    cons: ["Needs community buy-in to get started", "Details still need to be worked out"],
  };
}

const STATUS_OPTIONS: { value: SolutionStatus; label: string }[] = [
  { value: "proposed", label: "Proposed" },
  { value: "considering", label: "Considering" },
  { value: "trending", label: "Trending" },
  { value: "rejected", label: "Rejected" },
];

export function SuggestSolution({
  issueId,
  size = "default",
  canEdit,
}: {
  issueId: string;
  size?: "default" | "lg";
  canEdit: boolean;
}) {
  const { isSignedIn, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pros, setPros] = useState<ProConItem[]>([]);
  const [cons, setCons] = useState<ProConItem[]>([]);
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<SolutionStatus>("proposed");
  const [submitting, setSubmitting] = useState(false);

  const hasProsCons = pros.length > 0 || cons.length > 0;

  function generate() {
    const result = generatePlaceholderProsCons(title || description);
    setPros((prev) => [
      ...prev.filter((p) => p.source === "manual"),
      ...result.pros.map((text, i) => ({ id: `ai-pro-${Date.now()}-${i}`, text, source: "ai" as const })),
    ]);
    setCons((prev) => [
      ...prev.filter((c) => c.source === "manual"),
      ...result.cons.map((text, i) => ({ id: `ai-con-${Date.now()}-${i}`, text, source: "ai" as const })),
    ]);
  }

  function addManualPro() {
    if (!newPro.trim()) return;
    setPros((prev) => [...prev, { id: `manual-pro-${Date.now()}`, text: newPro.trim(), source: "manual" }]);
    setNewPro("");
  }
  function addManualCon() {
    if (!newCon.trim()) return;
    setCons((prev) => [...prev, { id: `manual-con-${Date.now()}`, text: newCon.trim(), source: "manual" }]);
    setNewCon("");
  }

  function removePro(id: string) {
    setPros((prev) => prev.filter((p) => p.id !== id));
  }
  function removeCon(id: string) {
    setCons((prev) => prev.filter((c) => c.id !== id));
  }

  function reset(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSubmitted(false);
      setTitle("");
      setDescription("");
      setPros([]);
      setCons([]);
      setNewPro("");
      setNewCon("");
      setPhone("");
      setStatus("proposed");
      router.refresh();
    }
  }

  async function submit() {
    if (!user || submitting) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("solutions").insert({
      issue_id: issueId,
      title: title.trim(),
      description: description.trim(),
      pros: pros.map((p) => p.text),
      cons: cons.map((c) => c.text),
      status: "proposed",
      review_status: "pending",
      submitted_by: user.id,
      submitter_phone: phone.trim() || null,
    });
    setSubmitting(false);
    if (error) return;
    setSubmitted(true);
  }

  async function submitAdmin() {
    if (!user || submitting) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("solutions").insert({
      issue_id: issueId,
      title: title.trim(),
      description: description.trim(),
      pros: pros.map((p) => p.text),
      cons: cons.map((c) => c.text),
      status,
      review_status: "approved",
      submitted_by: user.id,
    });
    setSubmitting(false);
    if (error) return;
    reset(false);
  }

  const triggerLabel = "Suggest solution";

  return (
    <>
      {canEdit ? (
        <Button
          variant="outline"
          size={size === "lg" ? "lg" : "icon"}
          onClick={() => setOpen(true)}
          aria-label="Add a solution"
        >
          <Icon icon={IconPlus} />
        </Button>
      ) : (
        <Button
          variant="outline"
          size={size === "lg" ? "lg" : "default"}
          className="w-fit"
          onClick={() => setOpen(true)}
        >
          <Icon icon={IconPlus} />
          {triggerLabel}
        </Button>
      )}

      <Dialog open={open} onOpenChange={reset}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {!isSignedIn && !canEdit ? (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">Sign in</DialogTitle>
              </DialogHeader>
              <AuthGate
                title="Sign in to suggest a solution"
                description="You'll need an account so admins know who submitted it."
              />
            </>
          ) : submitted ? (
            <>
              <DialogHeader>
                <DialogTitle>Your solution was submitted</DialogTitle>
                <DialogDescription>
                  Admins will review it — if approved, it&apos;ll be posted on the main screen as a
                  proposed solution.
                </DialogDescription>
              </DialogHeader>
              <Button onClick={() => reset(false)}>Close</Button>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{canEdit ? "Add a solution" : "Suggest a solution"}</DialogTitle>
                <DialogDescription>
                  {canEdit
                    ? "You're adding this directly — it'll appear in the list right away."
                    : "Propose an approach — admins review submissions before they go live."}
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="solution-title">Solution name</Label>
                  <Input
                    id="solution-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Weekly carpool for seminary girls"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="solution-description">Description</Label>
                  <Textarea
                    id="solution-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's the idea, and how would it work?"
                    className="min-h-20"
                  />
                </div>

                {canEdit && (
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
                    <p className="text-xs text-muted-foreground">
                      To mark a solution Chosen, use the status dropdown on its card after adding it.
                    </p>
                  </div>
                )}

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-fit"
                  onClick={generate}
                  disabled={!title.trim() && !description.trim()}
                >
                  <Icon icon={IconSparkles} size={16} />
                  {hasProsCons ? "Regenerate pros & cons" : "Generate pros & cons"}
                </Button>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>Pros</Label>
                    {pros.map((pro) => (
                      <div
                        key={pro.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-status-resolved/10 px-3 py-1.5 text-sm"
                      >
                        {pro.text}
                        <button type="button" onClick={() => removePro(pro.id)} aria-label="Remove">
                          <Icon icon={IconX} size={14} className="text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={newPro}
                        onChange={(e) => setNewPro(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addManualPro())}
                        placeholder="Add your own..."
                        className="h-8 text-sm"
                      />
                      <button
                        type="button"
                        onClick={addManualPro}
                        aria-label="Add pro"
                        className="flex size-8 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <Icon icon={IconCheck} size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Cons</Label>
                    {cons.map((con) => (
                      <div
                        key={con.id}
                        className="flex items-center justify-between gap-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-sm"
                      >
                        {con.text}
                        <button type="button" onClick={() => removeCon(con.id)} aria-label="Remove">
                          <Icon icon={IconX} size={14} className="text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={newCon}
                        onChange={(e) => setNewCon(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addManualCon())}
                        placeholder="Add your own..."
                        className="h-8 text-sm"
                      />
                      <button
                        type="button"
                        onClick={addManualCon}
                        aria-label="Add con"
                        className="flex size-8 shrink-0 items-center justify-center rounded-md border border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <Icon icon={IconCheck} size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {!canEdit && (
                  <div className="border-t border-border pt-3">
                    <Input
                      placeholder="Phone (optional)"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Only visible to admins — never shown publicly.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                {canEdit ? (
                  <Button onClick={submitAdmin} disabled={!title.trim() || !description.trim() || submitting}>
                    {submitting ? "Adding..." : "Add solution"}
                  </Button>
                ) : (
                  <Button onClick={submit} disabled={!title.trim() || !description.trim() || submitting}>
                    {submitting ? "Submitting..." : "Submit for review"}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
