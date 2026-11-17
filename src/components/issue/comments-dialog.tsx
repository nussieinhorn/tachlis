"use client";

import { useState } from "react";
import { IconMessageCircle } from "@tabler/icons-react";

import type { Comment } from "@/lib/mock-data";
import { CommentThread } from "@/components/issue/comment-thread";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";

/** Comments live in a pop-up instead of crowding the sidebar. */
export function CommentsDialog({
  issueId,
  comments,
  canEdit,
  commentsEnabled,
  commentsRequireLogin,
}: {
  issueId: string;
  comments: Comment[];
  canEdit: boolean;
  commentsEnabled: boolean;
  commentsRequireLogin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const count = comments.length;

  return (
    <>
      <Button type="button" variant="outline" className="w-full justify-between" onClick={() => setOpen(true)}>
        <span className="flex items-center gap-2">
          <Icon icon={IconMessageCircle} size={16} />
          Public comments
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold tabular-nums">{count}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Public comments</DialogTitle>
            <DialogDescription>Anyone can read these. Keep it kind and on topic.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-1">
            {canEdit && !commentsEnabled && (
              <p className="mb-3 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                Comments are off — only you can see this.
              </p>
            )}
            <CommentThread
              issueId={issueId}
              initialComments={comments}
              canModerate={canEdit}
              commentsEnabled={commentsEnabled}
              commentsRequireLogin={commentsRequireLogin}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
