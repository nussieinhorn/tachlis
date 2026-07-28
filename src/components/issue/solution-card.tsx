"use client";

import { useState } from "react";
import { IconArrowUp, IconCheck, IconX, IconMessageCircle } from "@tabler/icons-react";

import type { Solution } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Icon } from "@/components/ui/icon";

export function SolutionCard({ solution, headline = false }: { solution: Solution; headline?: boolean }) {
  const [open, setOpen] = useState(false);
  const [votes, setVotes] = useState(solution.votes);
  const [voted, setVoted] = useState(false);

  function castVote() {
    if (voted) return;
    setVoted(true);
    setVotes((v) => v + 1);
  }

  return (
    <>
      <Card
        className={headline ? "border-primary shadow-sm" : "cursor-pointer hover:shadow-sm"}
        onClick={() => setOpen(true)}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className={headline ? "text-xl" : undefined}>{solution.title}</CardTitle>
            {solution.status === "chosen" && <Badge variant="status-chosen">Chosen</Badge>}
          </div>
          <CardDescription className="line-clamp-2">{solution.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Icon icon={IconArrowUp} size={16} />
            {votes} votes
          </span>
          <span className="flex items-center gap-1">
            <Icon icon={IconMessageCircle} size={16} />
            {solution.comments.length}
          </span>
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{solution.title}</SheetTitle>
            <SheetDescription>{solution.description}</SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 px-6">
            <Button
              variant={voted ? "secondary" : "default"}
              className="w-fit"
              onClick={castVote}
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
                  {solution.cons.map((con) => (
                    <li key={con}>• {con}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Discussion ({solution.comments.length})
              </h4>
              {solution.comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {solution.comments.map((comment) => (
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
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
