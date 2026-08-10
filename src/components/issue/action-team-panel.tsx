"use client";

import { useState } from "react";
import { IconEye, IconEyeOff, IconMail, IconTrash, IconUserCheck, IconUserX } from "@tabler/icons-react";

import type { ActionPlan } from "@/lib/mock-data";
import { useAdminMode } from "@/lib/admin-mode";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Icon } from "@/components/ui/icon";

type PendingRequest = { name: string; email: string; phone: string };

// Demo-only pending requests so admins have something to approve without a second session.
const SEED_PENDING: PendingRequest[] = [
  { name: "Shloimy Katz", email: "shloimy.katz@example.com", phone: "555-0110" },
  { name: "Malky Rosen", email: "malky.rosen@example.com", phone: "555-0187" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ActionTeamPanel({ actionPlan }: { actionPlan?: ActionPlan }) {
  const { isAdmin } = useAdminMode();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [manageTab, setManageTab] = useState<"pending" | "active">("pending");
  const [submitted, setSubmitted] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>(
    actionPlan ? SEED_PENDING : [],
  );
  const [approvedNames, setApprovedNames] = useState<string[]>([]);
  const [removedNames, setRemovedNames] = useState<Set<string>>(new Set());
  const [hiddenNames, setHiddenNames] = useState<Set<string>>(new Set());

  const baseMembers = actionPlan ? [actionPlan.lead, ...actionPlan.volunteers] : [];
  const allActiveMembers = [...baseMembers, ...approvedNames];
  const members = allActiveMembers.filter((name) => !removedNames.has(name));
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

  function approve(request: PendingRequest) {
    // TODO(supabase): onApproveActionTeamRequest({ email: request.email })
    setApprovedNames((prev) => [...prev, request.name]);
    setPendingRequests((prev) => prev.filter((r) => r.email !== request.email));
  }

  function reject(request: PendingRequest) {
    // TODO(supabase): onRejectActionTeamRequest({ email: request.email })
    setPendingRequests((prev) => prev.filter((r) => r.email !== request.email));
  }

  function removeMember(name: string) {
    // TODO(supabase): onRemoveActionTeamMember({ name })
    setRemovedNames((prev) => new Set(prev).add(name));
  }

  function toggleHideMember(name: string) {
    // TODO(supabase): onToggleActionTeamMemberVisibility({ name })
    setHiddenNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
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
        {isAdmin && pendingRequests.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setManageTab("pending");
              setManageOpen(true);
            }}
            className="rounded-full bg-status-traction/15 px-2.5 py-0.5 text-xs font-medium text-status-traction hover:bg-status-traction/25"
          >
            {pendingRequests.length} pending
          </button>
        )}
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
            onClick={() => (isAdmin ? setManageOpen(true) : setDetailsOpen(true))}
            className="text-sm font-medium text-primary hover:underline"
          >
            {isAdmin ? "Manage" : "Details"}
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

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage action team</DialogTitle>
            <DialogDescription>Approve requests or manage current members.</DialogDescription>
          </DialogHeader>
          <Tabs value={manageTab} onValueChange={(v) => setManageTab(v as "pending" | "active")}>
            <TabsList className="w-full">
              <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({members.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="flex flex-col gap-2 pt-3">
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending requests.</p>
              ) : (
                pendingRequests.map((request) => (
                  <div
                    key={request.email}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                  >
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium text-foreground">{request.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{request.email}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button size="sm" variant="outline" onClick={() => approve(request)}>
                        <Icon icon={IconUserCheck} size={14} />
                        Approve
                      </Button>
                      <button
                        type="button"
                        onClick={() => reject(request)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Reject"
                      >
                        <Icon icon={IconUserX} size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
            <TabsContent value="active" className="flex flex-col gap-2 pt-3">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active members yet.</p>
              ) : (
                members.map((name, i) => (
                  <div
                    key={name}
                    className={
                      "flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2" +
                      (hiddenNames.has(name) ? " opacity-50" : "")
                    }
                  >
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium text-foreground">{name}</span>
                      <span className="text-xs text-muted-foreground">
                        {i === 0 ? "Project lead" : "Volunteer"}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleHideMember(name)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        aria-label={hiddenNames.has(name) ? "Unhide" : "Hide"}
                      >
                        <Icon icon={hiddenNames.has(name) ? IconEye : IconEyeOff} size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMember(name)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Remove"
                      >
                        <Icon icon={IconTrash} size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
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
