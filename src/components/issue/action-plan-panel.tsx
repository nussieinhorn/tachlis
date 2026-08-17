"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconDots,
  IconEye,
  IconEyeOff,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";

import type { ActionPlan, ActionTask, ActionTaskStatus } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const TASK_STATUS_CONFIG: Record<ActionTaskStatus, { label: string; variant: BadgeVariant }> = {
  "not-started": { label: "Not started", variant: "outline" },
  "in-progress": { label: "In progress", variant: "status-proposed" },
  "needs-financing": { label: "Needs financing", variant: "status-traction" },
  stuck: { label: "Stuck", variant: "destructive" },
  done: { label: "Done", variant: "status-resolved" },
};

const STATUS_KEYS = Object.keys(TASK_STATUS_CONFIG) as ActionTaskStatus[];

export function ActionPlanPanel({
  actionPlanId,
  plan,
  canEdit,
}: {
  actionPlanId: string;
  plan: ActionPlan;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const tasks = plan.tasks;
  const visibleTasks = canEdit ? tasks : tasks.filter((t) => !t.hidden);
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const progressPct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  async function move(id: string, dir: -1 | 1) {
    const idx = tasks.findIndex((t) => t.id === id);
    const otherIdx = idx + dir;
    if (idx === -1 || otherIdx < 0 || otherIdx >= tasks.length) return;
    const supabase = createClient();
    await Promise.all([
      supabase.from("action_tasks").update({ sort_order: otherIdx }).eq("id", tasks[idx].id),
      supabase.from("action_tasks").update({ sort_order: idx }).eq("id", tasks[otherIdx].id),
    ]);
    router.refresh();
  }

  async function changeStatus(id: string, status: ActionTaskStatus) {
    const supabase = createClient();
    await supabase.from("action_tasks").update({ status }).eq("id", id);
    router.refresh();
  }

  function startEdit(task: ActionTask) {
    setEditingId(task.id);
    setEditText(task.title);
  }

  async function saveEdit() {
    if (!editingId || !editText.trim()) return;
    const supabase = createClient();
    await supabase.from("action_tasks").update({ title: editText.trim() }).eq("id", editingId);
    setEditingId(null);
    router.refresh();
  }

  async function toggleHide(id: string, hidden: boolean) {
    const supabase = createClient();
    await supabase.from("action_tasks").update({ hidden: !hidden }).eq("id", id);
    router.refresh();
  }

  async function duplicate(task: ActionTask) {
    const supabase = createClient();
    await supabase.from("action_tasks").insert({
      action_plan_id: actionPlanId,
      title: task.title,
      status: task.status,
      sort_order: tasks.length,
    });
    router.refresh();
  }

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("action_tasks").delete().eq("id", id);
    router.refresh();
  }

  async function addTask() {
    if (!newTaskTitle.trim()) return;
    const supabase = createClient();
    await supabase.from("action_tasks").insert({
      action_plan_id: actionPlanId,
      title: newTaskTitle.trim(),
      status: "not-started",
      sort_order: tasks.length,
    });
    setNewTaskTitle("");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Action plan</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">
            {progressPct}% complete
          </span>
        </div>
        <Progress value={progressPct} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pb-6">
        <ul className="flex flex-col gap-1.5">
          {visibleTasks.map((task) => {
            const config = TASK_STATUS_CONFIG[task.status];
            const isEditing = editingId === task.id;
            return (
              <li
                key={task.id}
                className={
                  "group flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-1.5" +
                  (task.hidden && canEdit ? " opacity-50" : "")
                }
              >
                {isEditing ? (
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    />
                    <Button size="sm" className="h-7" onClick={saveEdit}>
                      Save
                    </Button>
                  </div>
                ) : (
                  <span className="flex items-center gap-2 text-sm text-foreground">
                    {task.status === "done" && (
                      <Icon icon={IconCheck} size={16} className="text-status-resolved" />
                    )}
                    {task.title}
                  </span>
                )}

                <div className="flex shrink-0 items-center gap-1.5">
                  {canEdit ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button">
                          <Badge variant={config.variant} className="cursor-pointer gap-1">
                            {config.label}
                            <Icon icon={IconChevronDown} size={12} />
                          </Badge>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {STATUS_KEYS.map((s) => (
                          <DropdownMenuItem key={s} onClick={() => changeStatus(task.id, s)}>
                            {TASK_STATUS_CONFIG[s].label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Badge variant={config.variant}>{config.label}</Badge>
                  )}

                  {canEdit && (
                    <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => move(task.id, -1)}
                        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        aria-label="Move up"
                      >
                        <Icon icon={IconChevronUp} size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(task.id, 1)}
                        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        aria-label="Move down"
                      >
                        <Icon icon={IconChevronDown} size={14} />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            aria-label="Task options"
                          >
                            <Icon icon={IconDots} size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEdit(task)}>
                            <Icon icon={IconPencil} size={16} />
                            Edit name
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleHide(task.id, Boolean(task.hidden))}>
                            <Icon icon={task.hidden ? IconEye : IconEyeOff} size={16} />
                            {task.hidden ? "Unhide" : "Hide"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicate(task)}>
                            <Icon icon={IconCopy} size={16} />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => remove(task.id)}>
                            <Icon icon={IconTrash} size={16} />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {canEdit && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Add a task..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <Button size="sm" variant="outline" onClick={addTask} disabled={!newTaskTitle.trim()}>
              <Icon icon={IconPlus} size={14} />
              Add
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
