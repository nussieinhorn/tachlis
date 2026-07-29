import { IconCheck } from "@tabler/icons-react";

import type { ActionPlan, ActionTaskStatus } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
      <CardContent className="pb-6">
        <ul className="flex flex-col gap-1.5">
          {plan.tasks.map((task) => {
            const config = TASK_STATUS_CONFIG[task.status];
            return (
              <li
                key={task.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-1.5"
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
      </CardContent>
    </Card>
  );
}
