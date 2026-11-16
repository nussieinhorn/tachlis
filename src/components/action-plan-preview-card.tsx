import Link from "next/link";
import { IconArrowRight, IconCircleCheck } from "@tabler/icons-react";

import type { ActionPlanPreview } from "@/lib/supabase/queries";
import { Icon } from "@/components/ui/icon";

export function ActionPlanPreviewCard({ plan }: { plan: ActionPlanPreview }) {
  const pct = plan.total === 0 ? 0 : Math.round((plan.done / plan.total) * 100);
  return (
    <Link
      href={`/issues/${plan.issueCode}`}
      className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-lg"
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {plan.location || "Action plan"}
        </span>
        <h3 className="type-subsection group-hover:text-primary">
          {plan.issueTitle}
        </h3>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">
            {plan.done} of {plan.total} steps done
          </span>
          <span className="text-muted-foreground tabular-nums">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {plan.nextTask && (
        <p className="flex items-start gap-2 text-sm text-muted-foreground">
          <Icon icon={IconCircleCheck} size={16} className="mt-0.5 shrink-0" />
          <span>
            <span className="font-semibold text-foreground">Next:</span> {plan.nextTask}
          </span>
        </p>
      )}
      <span className="mt-auto flex items-center gap-1 text-sm font-semibold text-primary">
        Follow the plan
        <Icon icon={IconArrowRight} size={14} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
