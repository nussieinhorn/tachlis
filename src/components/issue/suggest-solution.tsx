"use client";

import { useState } from "react";
import { IconPlus, IconSparkles, IconX } from "@tabler/icons-react";

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

// Placeholder heuristic — swap for a real generation call once there's a backend.
function generatePlaceholderProsCons(title: string): { pros: string[]; cons: string[] } {
  const subject = title.trim() || "this solution";
  return {
    pros: [`Directly addresses "${subject}"`, "Could be organized largely by volunteers"],
    cons: ["Needs community buy-in to get started", "Details still need to be worked out"],
  };
}

export function SuggestSolution() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [joinTeam, setJoinTeam] = useState(false);

  function generate() {
    const result = generatePlaceholderProsCons(title || description);
    setPros(result.pros);
    setCons(result.cons);
  }

  function removePro(i: number) {
    setPros((prev) => prev.filter((_, idx) => idx !== i));
  }
  function removeCon(i: number) {
    setCons((prev) => prev.filter((_, idx) => idx !== i));
  }

  function reset(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSubmitted(false);
      setTitle("");
      setDescription("");
      setPros([]);
      setCons([]);
      setName("");
      setEmail("");
      setPhone("");
      setJoinTeam(false);
    }
  }

  function submit() {
    // TODO(supabase): onSuggestSolution({ issueId, title, description, pros, cons, name, email, phone, joinTeam })
    // goes to an admin review queue before appearing publicly.
    setSubmitted(true);
  }

  return (
    <>
      <Button variant="outline" className="w-fit" onClick={() => setOpen(true)}>
        <Icon icon={IconPlus} />
        Suggest a solution
      </Button>

      <Dialog open={open} onOpenChange={reset}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {submitted ? (
            <>
              <DialogHeader>
                <DialogTitle>Your solution was submitted</DialogTitle>
                <DialogDescription>
                  Admins will review it — if approved, it'll be posted on the main screen as a
                  proposed solution. (This is a static prototype, so nothing was actually saved.)
                </DialogDescription>
              </DialogHeader>
              <Button onClick={() => reset(false)}>Close</Button>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Suggest a solution</DialogTitle>
                <DialogDescription>
                  Propose an approach — admins review submissions before they go live.
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

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-fit"
                  onClick={generate}
                  disabled={!title.trim() && !description.trim()}
                >
                  <Icon icon={IconSparkles} size={16} />
                  Generate pros &amp; cons
                </Button>

                {(pros.length > 0 || cons.length > 0) && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label>Pros</Label>
                      {pros.map((pro, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 rounded-lg bg-status-resolved/10 px-3 py-1.5 text-sm"
                        >
                          {pro}
                          <button type="button" onClick={() => removePro(i)} aria-label="Remove">
                            <Icon icon={IconX} size={14} className="text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Cons</Label>
                      {cons.map((con, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-2 rounded-lg bg-destructive/10 px-3 py-1.5 text-sm"
                        >
                          {con}
                          <button type="button" onClick={() => removeCon(i)} aria-label="Remove">
                            <Icon icon={IconX} size={14} className="text-muted-foreground" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 border-t border-border pt-3 sm:grid-cols-3">
                  <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Phone (optional)"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={joinTeam}
                    onChange={(e) => setJoinTeam(e.target.checked)}
                    className="size-4 rounded border-border"
                  />
                  I'd like to join the action team if this is chosen
                </label>
              </div>

              <DialogFooter>
                <Button
                  onClick={submit}
                  disabled={!title.trim() || !description.trim() || !name.trim() || !email.trim()}
                >
                  Submit for review
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
