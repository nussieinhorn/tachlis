"use client";

import { useState } from "react";
import { IconArrowUp, IconCheck, IconX, IconMessageCircle, IconStar } from "@tabler/icons-react";

import type { Comment, Solution } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);
  const [votes, setVotes] = useState(solution.votes);
  const [voted, setVoted] = useState(false);
  const [comments, setComments] = useState<Comment[]>(solution.comments);
  const [draft, setDraft] = useState("");

  function castVote(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (voted) return;
    setVoted(true);
    setVotes((v) => v + 1);
  }

  function postComment() {
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
            <div className="flex shrink-0 flex-col items-end gap-2">
              {solution.status === "chosen" && <Badge variant="status-chosen">Chosen</Badge>}
              {leading && (
                <Badge variant="status-traction" className="gap-1">
                  <Icon icon={IconStar} size={12} />
                  Leading
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="line-clamp-3 text-base">
            {solution.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
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
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            {typeof index === "number" && (
              <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Solution {index + 1}
              </span>
            )}
            <SheetTitle className="text-xl">{solution.title}</SheetTitle>
            <SheetDescription className="text-base">{solution.description}</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 px-6">
            <Button
              variant={voted ? "secondary" : "default"}
              className="w-fit"
              onClick={() => castVote()}
            >
              <Icon icon={IconArrowUp} />
              {votes} {voted ? "· voted" : "votes"}
            </Button>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <h4 className="flex items-center gap-1 text-sm font-medium text-status-resolved">
                  <Icon icon={IconCheck} size={16} />
                  Pros
                </h4>
                <ul className="flex flex-col gap-1 text-sm text-foreground/80">
                  {solution.pros.map((pro) => (
                    <li key={pro}>• {pro}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="flex items-center gap-1 text-sm font-medium text-destructive">
                  <Icon icon={IconX} size={16} />
                  Cons
                </h4>
                <ul className="flex flex-col gap-1 text-sm text-foreground/80">
                  {solution.cons.length === 0 ? (
                    <li className="text-muted-foreground">None reported</li>
                  ) : (
                    solution.cons.map((con) => <li key={con}>• {con}</li>)
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
