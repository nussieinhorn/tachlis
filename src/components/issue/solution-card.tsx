"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowUp, IconCheck, IconX, IconMessageCircle, IconDots, IconEyeOff, IconEye, IconTrash, IconPencil, IconChevronDown } from "@tabler/icons-react";

import type { Solution, SolutionStatus } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { abbreviateLocation, abbreviateName, formatRelativeTime } from "@/lib/format";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { ChosenSolutionDialog } from "@/components/issue/chosen-solution-dialog";
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
  issueId,
  index,
  headline = false,
  canEdit,
  isFirstChosen,
  commentsEnabled = true,
  commentsRequireLogin = false,
}: {
  solution: Solution;
  issueId: string;
  index?: number;
  headline?: boolean;
  canEdit: boolean;
  /** Whether marking this issue's solution "Chosen" would be the first time ever on this issue. */
  isFirstChosen: boolean;
  commentsEnabled?: boolean;
  commentsRequireLogin?: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [chosenDialogOpen, setChosenDialogOpen] = useState(false);
  const [votes, setVotes] = useState(solution.votes);
  const [voted, setVoted] = useState(false);
  const [voteRowId, setVoteRowId] = useState<string | null>(null);
  const [unvoteOpen, setUnvoteOpen] = useState(false);

  const statusConfig = SOLUTION_STATUS_CONFIG[solution.status];
  const hidden = Boolean(solution.hidden);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("solution_votes")
      .select("id")
      .eq("solution_id", solution.id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setVoted(true);
          setVoteRowId(data.id);
        }
      });
  }, [user, solution.id]);

  async function changeStatus(next: SolutionStatus, e?: React.MouseEvent) {
    e?.stopPropagation();
    if (next === "chosen" && isFirstChosen) {
      setChosenDialogOpen(true);
      return;
    }
    const supabase = createClient();
    await supabase
      .from("solutions")
      .update({ status: next, is_chosen: next === "chosen" })
      .eq("id", solution.id);
    router.refresh();
  }

  if (hidden && !canEdit) return null;

  async function castVote(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (voted) {
      setUnvoteOpen(true);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("solution_votes")
      .insert({ solution_id: solution.id, user_id: user?.id ?? null })
      .select("id")
      .single();
    if (error) return;
    setVoted(true);
    setVoteRowId(data?.id ?? null);
    setVotes((v) => v + 1);
  }

  async function removeVote(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (!voteRowId) {
      setUnvoteOpen(false);
      return;
    }
    const supabase = createClient();
    await supabase.from("solution_votes").delete().eq("id", voteRowId);
    setVoted(false);
    setVoteRowId(null);
    setVotes((v) => Math.max(0, v - 1));
    setUnvoteOpen(false);
  }

  async function toggleHide(e?: React.MouseEvent) {
    e?.stopPropagation();
    const supabase = createClient();
    await supabase.from("solutions").update({ hidden: !hidden }).eq("id", solution.id);
    router.refresh();
  }

  async function deleteSolution(e?: React.MouseEvent) {
    e?.stopPropagation();
    const supabase = createClient();
    await supabase.from("solutions").update({ deleted: true }).eq("id", solution.id);
    router.refresh();
  }

  const adminMenu = canEdit && (
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
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={() => setEditOpen(true)}>
          <Icon icon={IconPencil} size={16} />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleHide}>
          <Icon icon={hidden ? IconEye : IconEyeOff} size={16} />
          {hidden ? "Unhide" : "Hide"}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={deleteSolution}>
          <Icon icon={IconTrash} size={16} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const editPencil = canEdit && (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setEditOpen(true);
      }}
      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      aria-label="Edit solution"
    >
      <Icon icon={IconPencil} size={16} />
    </button>
  );

  const metaLine = solution.submitter && (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      {abbreviateName(solution.submitter.name)}
      {solution.submitter.location && ` · ${abbreviateLocation(solution.submitter.location)}`}
      {" · "}
      {formatRelativeTime(solution.createdAt)}
    </span>
  );

  return (
    <>
      <Card
        className={cn(
          "cursor-pointer gap-3 transition-shadow hover:shadow-sm",
          headline && "border-primary shadow-sm",
          hidden && canEdit && "opacity-50",
        )}
        onClick={() => setOpen(true)}
      >
        <CardHeader className="px-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              {typeof index === "number" && (
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Solution {index + 1}
                </span>
              )}
              <CardTitle className={headline ? "text-xl" : "text-base"}>{solution.title}</CardTitle>
            </div>
            <div className="flex shrink-0 items-start gap-1">
              {canEdit ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" onClick={(e) => e.stopPropagation()}>
                      <Badge variant={statusConfig.variant} className="cursor-pointer gap-1">
                        {statusConfig.label}
                        <Icon icon={IconChevronDown} size={12} />
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
          <CardDescription className="line-clamp-2 text-sm">
            {solution.description}
          </CardDescription>
          {metaLine}
          {hidden && canEdit && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon icon={IconEyeOff} size={12} />
              Hidden — not visible to the public
            </p>
          )}
        </CardHeader>
        <CardContent className="flex items-center gap-3 px-4 pb-4">
          <Button
            size="sm"
            variant={voted ? "secondary" : "outline"}
            onClick={castVote}
            className="gap-1.5"
          >
            <Icon icon={voted ? IconCheck : IconArrowUp} size={16} />
            {votes}
          </Button>
          {commentsEnabled && (
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Icon icon={IconMessageCircle} size={16} />
              {solution.comments.length}
            </span>
          )}
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-xl">
          <SheetHeader className="gap-3">
            <div className="flex items-center gap-2 pr-8">
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {typeof index === "number" ? `Solution ${index + 1}` : "Solution"} · #{solution.displayCode}
              </span>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              <div className="ml-auto flex items-center gap-1">
                {editPencil}
                {adminMenu}
              </div>
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
            {metaLine}
          </SheetHeader>

          <div className="flex flex-col gap-6 px-6">
            {canEdit && solution.submitter && (
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
                solutionId={solution.id}
                initialComments={solution.comments}
                postPlaceholder="Add a comment on this solution..."
                emptyText="No comments yet."
                commentsEnabled={commentsEnabled}
                commentsRequireLogin={commentsRequireLogin}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {canEdit && (
        <SolutionEditDialog
          solution={solution}
          open={editOpen}
          onOpenChange={setEditOpen}
          isFirstChosen={isFirstChosen}
          onRequestChosenFlow={() => setChosenDialogOpen(true)}
        />
      )}

      <ChosenSolutionDialog
        open={chosenDialogOpen}
        onOpenChange={setChosenDialogOpen}
        issueId={issueId}
        solutionId={solution.id}
      />

      <Dialog open={unvoteOpen} onOpenChange={setUnvoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove your vote?</DialogTitle>
            <DialogDescription>You can always vote for this solution again later.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setUnvoteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={removeVote}>
              Remove vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
