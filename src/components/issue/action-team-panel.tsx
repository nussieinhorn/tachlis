"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconEye, IconEyeOff, IconMail, IconTrash, IconUserCheck, IconUserX } from "@tabler/icons-react";

import type { ActionPlan } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
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

type PendingRequest = { id: string; name: string; email: string; phone: string | null; taskIds: string[] };

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ActionTeamPanel({
  issueId,
  actionPlan,
  canEdit,
}: {
  issueId: string;
  actionPlan?: ActionPlan;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [manageTab, setManageTab] = useState<"pending" | "active">("pending");
  const [submitted, setSubmitted] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  useEffect(() => {
    if (!canEdit) return;
    const supabase = createClient();
    supabase
      .from("action_team_requests")
      .select("id, name, email, phone, task_ids")
      .eq("issue_id", issueId)
      .eq("status", "pending")
      .then(({ data }) => {
        setPendingRequests(
          (data ?? []).map((r) => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, taskIds: r.task_ids ?? [] })),
        );
      });
  }, [canEdit, issueId]);

  const lead = actionPlan?.lead;
  const teamMembers = actionPlan?.teamMembers ?? [];
  const visibleMembers = teamMembers.filter((m) => canEdit || !m.hidden);
  const openTasks = actionPlan?.tasks.filter((t) => t.status !== "done" && !t.hidden) ?? [];

  function toggleTask(taskId: string) {
    setSelectedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((t) => t !== taskId) : [...prev, taskId],
    );
  }

  async function onSubmitJoin() {
    const supabase = createClient();
    const { error } = await supabase.from("action_team_requests").insert({
      issue_id: issueId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      message: message.trim() || null,
      task_ids: selectedTasks,
    });
    if (error) return;
    setSubmitted(true);
  }

  function resetJoin(open: boolean) {
    setJoinOpen(open);
    if (!open) {
      setSubmitted(false);
      setSelectedTasks([]);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }
  }

  async function approve(request: PendingRequest) {
    const supabase = createClient();
    await supabase
      .from("action_team_members")
      .insert({ issue_id: issueId, name: request.name, email: request.email, phone: request.phone, role: "volunteer", status: "active" });
    await supabase.from("action_team_requests").update({ status: "approved" }).eq("id", request.id);
    setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
    router.refresh();
  }

  async function reject(request: PendingRequest) {
    const supabase = createClient();
    await supabase.from("action_team_requests").update({ status: "rejected" }).eq("id", request.id);
    setPendingRequests((prev) => prev.filter((r) => r.id !== request.id));
  }

  async function removeMember(memberId: string) {
    const supabase = createClient();
    await supabase.from("action_team_members").update({ status: "removed" }).eq("id", memberId);
    router.refresh();
  }

  async function toggleHideMember(memberId: string, hidden: boolean) {
    const supabase = createClient();
    await supabase.from("action_team_members").update({ status: hidden ? "active" : "hidden" }).eq("id", memberId);
    router.refresh();
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
        {canEdit && pendingRequests.length > 0 && (
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

      {visibleMembers.length === 0 && !lead ? (
        <p className="text-sm text-muted-foreground">No one has joined the action team yet.</p>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {lead && (
              <Avatar className="border-2 border-background">
                <AvatarFallback>{initials(lead)}</AvatarFallback>
              </Avatar>
            )}
            {visibleMembers.slice(0, lead ? 4 : 5).map((m) => (
              <Avatar key={m.id} className="border-2 border-background">
                <AvatarFallback>{initials(m.name)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <button
            type="button"
            onClick={() => (canEdit ? setManageOpen(true) : setDetailsOpen(true))}
            className="text-sm font-medium text-primary hover:underline"
          >
            {canEdit ? "Manage" : "Details"}
          </button>
        </div>
      )}

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Action team</DialogTitle>
          </DialogHeader>
          <ul className="flex flex-col gap-3">
            {lead && (
              <li className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initials(lead)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-foreground">{lead}</span>
                  <span className="text-xs text-muted-foreground">Project lead</span>
                </div>
              </li>
            )}
            {visibleMembers.map((m) => (
              <li key={m.id} className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{initials(m.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-medium text-foreground">{m.name}</span>
                  <span className="text-xs text-muted-foreground">Volunteer</span>
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
              <TabsTrigger value="active">Active ({visibleMembers.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="flex flex-col gap-2 pt-3">
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending requests.</p>
              ) : (
                pendingRequests.map((request) => (
                  <div
                    key={request.id}
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
              {visibleMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active members yet.</p>
              ) : (
                visibleMembers.map((m) => (
                  <div
                    key={m.id}
                    className={
                      "flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2" +
                      (m.hidden ? " opacity-50" : "")
                    }
                  >
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium text-foreground">{m.name}</span>
                      <span className="text-xs text-muted-foreground">Volunteer</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleHideMember(m.id, m.hidden)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        aria-label={m.hidden ? "Unhide" : "Hide"}
                      >
                        <Icon icon={m.hidden ? IconEye : IconEyeOff} size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMember(m.id)}
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
                  An admin will follow up once they review your request.
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
                <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
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
              <Textarea
                placeholder="Anything else you'd like the organizers to know? (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <DialogFooter>
                <Button onClick={onSubmitJoin} disabled={!name.trim() || !email.trim()}>
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
