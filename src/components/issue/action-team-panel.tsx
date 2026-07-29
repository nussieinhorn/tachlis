"use client";

import { useState } from "react";
import { IconMail } from "@tabler/icons-react";

import type { ActionPlan } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ActionTeamPanel({ actionPlan }: { actionPlan?: ActionPlan }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const members = actionPlan ? [actionPlan.lead, ...actionPlan.volunteers] : [];
  const openTasks = actionPlan?.tasks.filter((t) => t.status !== "done") ?? [];

  function toggleTask(taskId: string) {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((t) => t !== taskId) : [...prev, taskId],
    );
  }

  function onSubmitJoin() {
    // TODO(supabase): onJoinActionTeam({ issueId, taskIds: selectedTasks, email, phone })
    setSubmitted(true);
  }

  function resetJoin(open: boolean) {
    setJoinOpen(open);
    if (!open) {
      setSubmitted(false);
      setSelectedTasks([]);
      setEmail("");
      setPhone("");
    }
  }

  return (
    <section className="flex flex-col gap-3 border-t border-border pt-6">
      <div className="flex items-center gap-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">Action Team</h2>
        <button
          type="button"
          onClick={() => setJoinOpen(true)}
          className="text-sm font-medium text-primary hover:underline"
        >
          Join!
        </button>
        <a
          href="mailto:admin@tachlis.org"
          className="ml-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          <Icon icon={IconMail} size={14} />
          Contact admin
        </a>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">No one has joined the action team yet.</p>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((name) => (
              <Avatar key={name} className="border-2 border-background">
                <AvatarFallback>{initials(name)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            className="text-sm font-medium text-primary hover:underline"
          >
            Details
          </button>
        </div>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Action team</DialogTitle>
          </DialogHeader>
          <ul className="flex flex-col gap-3">
            {members.map((name, i) => (
              <li key={name} className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initials(name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-foreground">{name}</span>
                  <span className="text-xs text-muted-foreground">
                    {i === 0 ? "Project lead" : "Volunteer"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog open={joinOpen} onOpenChange={resetJoin}>
        <DialogContent>
          {submitted ? (
            <>
              <DialogHeader>
                <DialogTitle>Thanks for offering to help!</DialogTitle>
                <DialogDescription>
                  This is a static prototype, so nothing was actually sent — but this is the
                  confirmation you'd see once it's live.
                </DialogDescription>
              </DialogHeader>
              <Button onClick={() => resetJoin(false)}>Close</Button>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Join the action team</DialogTitle>
                <DialogDescription>
                  {openTasks.length > 0
                    ? "Which of these open tasks can you help with?"
                    : "Let us know how you'd like to help — no account needed."}
                </DialogDescription>
              </DialogHeader>

              {openTasks.length > 0 && (
                <div className="flex flex-col gap-2">
                  {openTasks.map((task) => {
                    const active = selectedTasks.includes(task.id);
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => toggleTask(task.id)}
                        className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                          active ? "border-primary bg-accent text-accent-foreground" : "border-border"
                        }`}
                      >
                        {task.title}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <Textarea placeholder="Anything else you'd like the organizers to know? (optional)" />

              <DialogFooter>
                <Button onClick={onSubmitJoin} disabled={!email.trim()}>
                  Submit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
