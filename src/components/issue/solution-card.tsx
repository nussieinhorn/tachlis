"use client";

import { useState } from "react";
import { IconArrowUp, IconCheck, IconX, IconMessageCircle, IconDots, IconEyeOff, IconEye, IconTrash, IconPencil } from "@tabler/icons-react";

import type { Solution, SolutionStatus } from "@/lib/mock-data";
import { useAdminMode } from "@/lib/admin-mode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { CommentThread } from "@/components/issue/comment-thread";
import { SolutionEditDialog } from "@/components/issue/solution-edit-dialog";
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export const SOLUTION_STATUS_CONFIG: Record<SolutionStatus, { label: string; variant: BadgeVariant }> = {
  proposed: { label: "Proposed", variant: "secondary" },
  considering: { label: "Considering", variant: "status-proposed" },
  trending: { label: "Trending", variant: "status-traction" },
  chosen: { label: "Chosen", variant: "status-chosen" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export function SolutionCard({
  solution,
  index,
  headline = false,
  onUpdate,
  onHide,
  onDelete,
}: {
  solution: Solution;
  index?: number;
  headline?: boolean;
  onUpdate: (patch: Partial<Solution>) => void;
  onHide: () => void;
  onDelete: () => void;
}) {
  const { isAdmin } = useAdminMode();
  const [open, setOpen] = useState(false);
  const [votes, setVotes] = useState(solution.votes);
  const [voted, setVoted] = useState(false);

  const statusConfig = SOLUTION_STATUS_CONFIG[solution.status];
  const hidden = Boolean(solution.hidden);

  function changeStatus(next: SolutionStatus, e?: React.MouseEvent) {
    e?.stopPropagation();
    onUpdate({ status: next });
  }

  if (hidden && !isAdmin) return null;

  function castVote(e?: React.MouseEvent) {
    e?.stopPropagation();
    // TODO(supabase): onVoteSolution({ solutionId: solution.id })
    if (voted) return;
    setVoted(true);
    setVotes((v) => v + 1);
  }

  const adminMenu = isAdmin && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Solution options"
        >
          <Icon icon={IconDots} size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <SolutionEditDialog
          solution={solution}
          onSave={onUpdate}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Icon icon={IconPencil} size={16} />
              Edit
            </DropdownMenuItem>
          }
        />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onHide();
          }}
        >
          <Icon icon={hidden ? IconEye : IconEyeOff} size={16} />
          {hidden ? "Unhide" : "Hide"}
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Icon icon={IconTrash} size={16} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <Card
        className={cn(
          "cursor-pointer transition-shadow hover:shadow-sm",
          headline && "border-primary shadow-sm",
          hidden && isAdmin && "opacity-50",
        )}
        onClick={() => setOpen(true)}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              {typeof index === "number" && (
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Solution {index + 1}
                </span>
              )}
              <CardTitle className={headline ? "text-2xl" : "text-xl"}>{solution.title}</CardTitle>
            </div>
            <div className="flex shrink-0 items-start gap-1">
              {isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" onClick={(e) => e.stopPropagation()}>
                      <Badge variant={statusConfig.variant} className="cursor-pointer">
                        {statusConfig.label}
                      </Badge>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(Object.keys(SOLUTION_STATUS_CONFIG) as SolutionStatus[]).map((s) => (
                      <DropdownMenuItem key={s} onClick={(e) => changeStatus(s, e)}>
                        {SOLUTION_STATUS_CONFIG[s].label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              )}
              {adminMenu}
            </div>
          </div>
          <CardDescription className="line-clamp-2 text-base">
            {solution.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3 pb-6">
          <Button
            size="sm"
            variant={voted ? "secondary" : "outline"}
            onClick={castVote}
            className="gap-1.5"
          >
            <Icon icon={voted ? IconCheck : IconArrowUp} size={16} />
            {votes}
          </Button>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Icon icon={IconMessageCircle} size={16} />
            {solution.comments.length}
          </span>
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader className="gap-3">
            <div className="flex items-center gap-2 pr-8">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {typeof index === "number" ? `Solution ${index + 1}` : "Solution"} · #{solution.id}
              </span>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              <div className="ml-auto">{adminMenu}</div>
            </div>
            <Button
              size="lg"
              variant={voted ? "secondary" : "default"}
              className="w-fit"
              onClick={() => castVote()}
            >
              <Icon icon={IconArrowUp} />
              {votes} {voted ? "· voted" : "votes"}
            </Button>
            <SheetTitle className="text-2xl">{solution.title}</SheetTitle>
            <SheetDescription className="text-base">{solution.description}</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 px-6">
            {isAdmin && solution.submitter && (
              <div className="flex flex-col gap-1 rounded-lg border border-dashed border-border bg-muted/40 p-3">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Submitted by (admin only)
                </span>
                <span className="text-sm text-foreground">{solution.submitter.name}</span>
                <span className="text-sm text-muted-foreground">{solution.submitter.email}</span>
                {solution.submitter.phone && (
                  <span className="text-sm text-muted-foreground">{solution.submitter.phone}</span>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <h4 className="flex items-center gap-1 text-sm font-medium text-status-resolved">
                  <Icon icon={IconCheck} size={16} />
                  Pros
                </h4>
                <ul className="flex flex-col gap-1.5">
                  {solution.pros.map((pro) => (
                    <li
                      key={pro}
                      className="flex items-start gap-2 rounded-lg bg-status-resolved/10 px-3 py-2 text-sm text-foreground/80"
                    >
                      <Icon icon={IconCheck} size={14} className="mt-0.5 shrink-0 text-status-resolved" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-1.5">
                <h4 className="flex items-center gap-1 text-sm font-medium text-destructive">
                  <Icon icon={IconX} size={16} />
                  Cons
                </h4>
                <ul className="flex flex-col gap-1.5">
                  {solution.cons.length === 0 ? (
                    <li className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                      None reported
                    </li>
                  ) : (
                    solution.cons.map((con) => (
                      <li
                        key={con}
                        className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-foreground/80"
                      >
                        <Icon icon={IconX} size={14} className="mt-0.5 shrink-0 text-destructive" />
                        {con}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Discussion ({solution.comments.length})
              </h4>
              <CommentThread
                initialComments={solution.comments}
                postPlaceholder="Add a comment on this solution..."
                emptyText="No comments yet."
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
