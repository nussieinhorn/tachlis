"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Comment } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

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

export function CommentThread({
  issueId,
  solutionId,
  initialComments,
  postPlaceholder = "Add to the discussion...",
  emptyText = "No discussion yet — be the first to say something.",
}: {
  issueId?: string;
  solutionId?: string;
  initialComments: Comment[];
  postPlaceholder?: string;
  emptyText?: string;
}) {
  const { isSignedIn, profile } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");
  const [guestName, setGuestName] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [error, setError] = useState<string | null>(null);

  const authorName = isSignedIn ? (profile?.name ?? "") : guestName.trim();

  async function post() {
    if (!draft.trim() || !authorName) return;
    setError(null);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("comments")
      .insert({
        issue_id: issueId ?? null,
        solution_id: solutionId ?? null,
        author_name: authorName,
        body: draft.trim(),
      })
      .select()
      .single();
    if (insertError || !data) {
      setError(insertError?.message ?? "Couldn't post that comment.");
      return;
    }
    setComments((prev) => [
      { id: data.id, author: data.author_name, body: data.body, createdAt: "Today" },
      ...prev,
    ]);
    setDraft("");
    router.refresh();
  }

  async function reply(parentId: string, body: string) {
    if (!authorName) return;
    setError(null);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("comments")
      .insert({
        issue_id: issueId ?? null,
        solution_id: solutionId ?? null,
        parent_comment_id: parentId,
        author_name: authorName,
        body,
      })
      .select()
      .single();
    if (insertError || !data) {
      setError(insertError?.message ?? "Couldn't post that reply.");
      return;
    }
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId
          ? {
              ...c,
              replies: [...(c.replies ?? []), { id: data.id, author: data.author_name, body: data.body, createdAt: "Today" }],
            }
          : c,
      ),
    );
    router.refresh();
  }

  const visible = comments.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {!isSignedIn && (
          <Input placeholder="Your name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
        )}
        <Textarea placeholder={postPlaceholder} value={draft} onChange={(e) => setDraft(e.target.value)} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button size="sm" className="w-fit" onClick={post} disabled={!draft.trim() || !authorName}>
          Post
        </Button>
      </div>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div
          className={cn(
            "flex flex-col gap-4 border-t border-border pt-4",
            comments.length > PAGE_SIZE && "max-h-[500px] overflow-y-auto pr-1",
          )}
        >
          <ul className="flex flex-col gap-4">
            {visible.map((comment) => (
              <CommentRow key={comment.id} comment={comment} onReply={reply} />
            ))}
          </ul>
          {visibleCount < comments.length && (
            <Button
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              Load more
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
