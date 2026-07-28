import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const ISSUE_STATUSES = [
  "new",
  "gaining-traction",
  "solutions-proposed",
  "solution-chosen",
  "in-action",
  "resolved",
] as const;

export type IssueStatus = (typeof ISSUE_STATUSES)[number];

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const STATUS_CONFIG: Record<IssueStatus, { label: string; variant: BadgeVariant }> = {
  new: { label: "New", variant: "status-new" },
  "gaining-traction": { label: "Gaining Traction", variant: "status-traction" },
  "solutions-proposed": { label: "Solutions Proposed", variant: "status-proposed" },
  "solution-chosen": { label: "Solution Chosen", variant: "status-chosen" },
  "in-action": { label: "In Action", variant: "status-action" },
  resolved: { label: "Resolved", variant: "status-resolved" },
};

export function StatusBadge({
  status,
  size = "default",
}: {
  status: IssueStatus;
  size?: "default" | "lg";
}) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant={config.variant}
      className={cn(size === "lg" && "px-4 py-1.5 text-sm font-semibold")}
    >
      {config.label}
    </Badge>
  );
}
