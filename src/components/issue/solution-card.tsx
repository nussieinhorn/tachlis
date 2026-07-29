"use client";

import { useState } from "react";
import { IconArrowUp, IconCheck, IconX, IconMessageCircle, IconStar, IconDots, IconEyeOff, IconEye, IconTrash } from "@tabler/icons-react";

import type { Comment, Solution, SolutionStatus } from "@/lib/mock-data";
import { useAdminMode } from "@/lib/admin-mode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import type { VariantProps } from "class-variance-authority";

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

const SOLUTION_STATUS_CONFIG: Record<SolutionStatus, { label: string; variant: BadgeVariant }> = {
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
  leading = false,
}: {
  solution: Solution;
  index?: number;
  headline?: boolean;
  leading?: boolean;
}) {
  const { isAdmin } = useAdminMode();
  const [open, setOpen] = useState(false);
  const [votes, setVotes] = useState(solution.votes);
  const [voted, setVoted] = useState(false);
  const [comments, setComments] = useState<Comment[]>(solution.comments);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<SolutionStatus>(solution.status);
  const [hidden, setHidden] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const statusConfig = SOLUTION_STATUS_CONFIG[status];

  function changeStatus(next: SolutionStatus) {
    // TODO(supabase): onUpdateSolutionStatus({ solutionId: solution.id, status: next })
    setStatus(next);
  }

  if (deleted) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground">
        <span>"{solution.title}" was deleted.</span>
        <button type="button" className="font-medium text-primary hover:underline" onClick={() => setDeleted(false)}>
          Undo
        </button>
      </div>
    );
  }

  if (hidden && !isAdmin) return null;

  function castVote(e?: React.MouseEvent) {
    e?.stopPropagation();
    // TODO(supabase): onVoteSolution({ solutionId: solution.id })
    if (voted) return;
    setVoted(true);
    setVotes((v) => v + 1);
  }

  function postComment() {
    // TODO(supabase): onCommentOnSolution({ solutionId: solution.id, body: draft })
    if (!draft.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: `local-${prev.length}`, author: "You", body: draft.trim(), createdAt: "just now" },
    ]);
    setDraft("");
  }

  return (
    <>
      <Card
        className={cn(
          "cursor-pointer transition-shadow hover:shadow-sm",
          headline && "border-primary shadow-sm",
          leading && "border-status-traction",
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
              <div className="flex flex-col items-end gap-2">
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
                        <DropdownMenuItem
                          key={s}
                          onClick={(e) => {
                            e.stopPropagation();
                            changeStatus(s);
                          }}
                        >
                          {SOLUTION_STATUS_CONFIG[s].label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                )}
                {leading && (
                  <Badge variant="status-traction" className="gap-1">
                    <Icon icon={IconStar} size={12} />
                    Leading
                  </Badge>
                )}
              </div>
              {isAdmin && (
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
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setHidden((h) => !h);
                      }}
                    >
                      <Icon icon={hidden ? IconEye : IconEyeOff} size={16} />
                      {hidden ? "Unhide" : "Hide"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleted(true);
                      }}
                    >
                      <Icon icon={IconTrash} size={16} />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <CardDescription className="line-clamp-3 text-base">
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
            {comments.length}
          </span>
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader className="gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {typeof index === "number" ? `Solution ${index + 1}` : "Solution"} · #{solution.id}
              </span>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
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
                Discussion ({comments.length})
              </h4>
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {comments.map((comment) => (
                    <li key={comment.id} className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">
                        {comment.author}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {comment.createdAt}
                        </span>
                      </span>
                      <span className="text-sm text-foreground/80">{comment.body}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <Textarea
                  placeholder="Add a comment on this solution..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="min-h-16"
                />
                <Button size="sm" className="w-fit" onClick={postComment} disabled={!draft.trim()}>
                  Post
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
