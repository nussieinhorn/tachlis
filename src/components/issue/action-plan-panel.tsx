"use client";

import { useState } from "react";
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
import { useAdminMode } from "@/lib/admin-mode";
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

export function ActionPlanPanel({ plan }: { plan: ActionPlan }) {
  const { isAdmin } = useAdminMode();
  const [tasks, setTasks] = useState<ActionTask[]>(plan.tasks);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const visibleTasks = isAdmin ? tasks : tasks.filter((t) => !hiddenIds.has(t.id));
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const progressPct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

  function move(id: string, dir: -1 | 1) {
    // TODO(supabase): onReorderActionTasks({ taskId: id, direction: dir })
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const nextIdx = idx + dir;
      if (idx === -1 || nextIdx < 0 || nextIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[nextIdx]] = [copy[nextIdx], copy[idx]];
      return copy;
    });
  }

  function changeStatus(id: string, status: ActionTaskStatus) {
    // TODO(supabase): onUpdateActionTaskStatus({ taskId: id, status })
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }

  function startEdit(task: ActionTask) {
    setEditingId(task.id);
    setEditText(task.title);
  }

  function saveEdit() {
    // TODO(supabase): onUpdateActionTaskTitle({ taskId: editingId, title: editText })
    setTasks((prev) =>
      prev.map((t) => (t.id === editingId ? { ...t, title: editText.trim() || t.title } : t)),
    );
    setEditingId(null);
  }

  function toggleHide(id: string) {
    // TODO(supabase): onToggleActionTaskVisibility({ taskId: id })
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function duplicate(id: string) {
    // TODO(supabase): onDuplicateActionTask({ taskId: id })
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      const task = prev[idx];
      if (!task) return prev;
      const copy = [...prev];
      copy.splice(idx + 1, 0, { ...task, id: `${task.id}-copy-${Date.now()}` });
      return copy;
    });
  }

  function remove(id: string) {
    // TODO(supabase): onDeleteActionTask({ taskId: id })
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function addTask() {
    if (!newTaskTitle.trim()) return;
    // TODO(supabase): onAddActionTask({ title: newTaskTitle })
    setTasks((prev) => [...prev, { id: `task-${Date.now()}`, title: newTaskTitle.trim(), status: "not-started" }]);
    setNewTaskTitle("");
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
            const hidden = hiddenIds.has(task.id);
            const isEditing = editingId === task.id;
            return (
              <li
                key={task.id}
                className={
                  "group flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-1.5" +
                  (hidden && isAdmin ? " opacity-50" : "")
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
                  {isAdmin ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button type="button">
                          <Badge variant={config.variant} className="cursor-pointer">
                            {config.label}
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

                  {isAdmin && (
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
                          <DropdownMenuItem onClick={() => toggleHide(task.id)}>
                            <Icon icon={hidden ? IconEye : IconEyeOff} size={16} />
                            {hidden ? "Unhide" : "Hide"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicate(task.id)}>
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

        {isAdmin && (
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
