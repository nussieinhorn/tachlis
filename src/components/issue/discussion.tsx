"use client";

import { useState } from "react";

import type { Comment } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function CommentRow({
  comment,
  onReply,
}: {
  comment: Comment;
  onReply: (parentId: string, body: string) => void;
}) {
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState("");

  function submitReply() {
    if (!draft.trim()) return;
    onReply(comment.id, draft.trim());
    setDraft("");
    setReplying(false);
  }

  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">
          {comment.author}{" "}
          <span className="text-xs font-normal text-muted-foreground">{comment.createdAt}</span>
        </span>
        <span className="text-sm text-foreground/80">{comment.body}</span>
        <button
          type="button"
          onClick={() => setReplying((r) => !r)}
          className="w-fit text-xs font-medium text-muted-foreground hover:text-primary hover:underline"
        >
          Reply
        </button>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <ul className="flex flex-col gap-2 border-l-2 border-border pl-3">
          {comment.replies.map((reply) => (
            <li key={reply.id} className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {reply.author}{" "}
                <span className="text-xs font-normal text-muted-foreground">{reply.createdAt}</span>
              </span>
              <span className="text-sm text-foreground/80">{reply.body}</span>
            </li>
          ))}
        </ul>
      )}

      {replying && (
        <div className="flex flex-col gap-2 border-l-2 border-border pl-3">
          <Textarea
            placeholder={`Reply to ${comment.author}...`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-14"
            autoFocus
          />
          <Button size="sm" className="w-fit" onClick={submitReply} disabled={!draft.trim()}>
            Post reply
          </Button>
        </div>
      )}
    </li>
  );
}

export function Discussion({ initialComments }: { initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");

  function post() {
    if (!draft.trim()) return;
    // TODO(supabase): onPostComment({ issueId, body: draft })
    setComments((prev) => [
      { id: `local-${Date.now()}`, author: "You", body: draft.trim(), createdAt: "just now" },
      ...prev,
    ]);
    setDraft("");
  }

  function reply(parentId: string, body: string) {
    // TODO(supabase): onReplyToComment({ commentId: parentId, body })
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? {
              ...c,
              replies: [
                ...(c.replies ?? []),
                { id: `local-reply-${Date.now()}`, author: "You", body, createdAt: "just now" },
              ],
            }
          : c,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="Add to the discussion..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button size="sm" className="w-fit" onClick={post} disabled={!draft.trim()}>
          Post
        </Button>
      </div>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No discussion yet — be the first to say something.</p>
      ) : (
        <ul className="flex flex-col gap-4 border-t border-border pt-4">
          {comments.map((comment) => (
            <CommentRow key={comment.id} comment={comment} onReply={reply} />
          ))}
        </ul>
      )}
    </div>
  );
}
