import { IconCheck } from "@tabler/icons-react";

import type { ActionPlan, ActionTaskStatus } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const TASK_STATUS_CONFIG: Record<ActionTaskStatus, { label: string; variant: BadgeVariant }> = {
  "not-started": { label: "Not started", variant: "outline" },
  "in-progress": { label: "In progress", variant: "status-proposed" },
  "needs-financing": { label: "Needs financing", variant: "status-traction" },
  stuck: { label: "Stuck", variant: "destructive" },
  done: { label: "Done", variant: "status-resolved" },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ActionPlanPanel({ plan }: { plan: ActionPlan }) {
  const doneCount = plan.tasks.filter((t) => t.status === "done").length;
  const progressPct = Math.round((doneCount / plan.tasks.length) * 100);

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
      <CardContent className="flex flex-col gap-6">
        <ul className="flex flex-col gap-2">
          {plan.tasks.map((task) => {
            const config = TASK_STATUS_CONFIG[task.status];
            return (
              <li
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm text-foreground">
                  {task.status === "done" && (
                    <Icon icon={IconCheck} size={16} className="text-status-resolved" />
                  )}
                  {task.title}
                </span>
                <Badge variant={config.variant}>{config.label}</Badge>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-medium text-muted-foreground">Team</h4>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{initials(plan.lead)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-foreground">{plan.lead}</span>
                <span className="text-xs text-muted-foreground">Project lead</span>
              </div>
            </div>
            {plan.volunteers.map((name) => (
              <div key={name} className="flex items-center gap-2">
                <Avatar>
                  <AvatarFallback>{initials(name)}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
