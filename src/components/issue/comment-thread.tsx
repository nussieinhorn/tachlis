"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconDots, IconTrash } from "@tabler/icons-react";

import type { Comment } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

/** The three-dot menu on a comment: delete, for its author or whoever manages the issue. */
function CommentMenu({ onDelete }: { onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Comment options"
          className="-mt-1 -mr-1.5 flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Icon icon={IconDots} size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ConfirmDialog
          title="Delete this comment?"
          description="It will be removed for everyone, along with any replies. This can't be undone."
          onConfirm={onDelete}
          trigger={
            <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
              <Icon icon={IconTrash} size={16} />
              Delete
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CommentRow({
  comment,
  onReply,
  canDelete,
  onDelete,
}: {
  comment: Comment;
  onReply: (parentId: string, body: string) => void;
  canDelete: (c: Comment) => boolean;
  onDelete: (id: string) => void;
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
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium text-foreground">
            {comment.author}{" "}
            <span className="text-xs font-normal text-muted-foreground">{comment.createdAt}</span>
          </span>
          {canDelete(comment) && <CommentMenu onDelete={() => onDelete(comment.id)} />}
        </div>
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
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-foreground">
                  {reply.author}{" "}
                  <span className="text-xs font-normal text-muted-foreground">{reply.createdAt}</span>
                </span>
                {canDelete(reply) && <CommentMenu onDelete={() => onDelete(reply.id)} />}
              </div>
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
  commentsEnabled = true,
  commentsRequireLogin = false,
  canModerate = false,
}: {
  issueId?: string;
  solutionId?: string;
  initialComments: Comment[];
  postPlaceholder?: string;
  emptyText?: string;
  commentsEnabled?: boolean;
  commentsRequireLogin?: boolean;
  /** Issue managers can delete anyone's comment. */
  canModerate?: boolean;
}) {
  const { isSignedIn, profile, user } = useAuth();
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
        author_id: user?.id ?? null,
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
      { id: data.id, author: data.author_name, authorId: data.author_id, body: data.body, createdAt: "just now" },
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
        author_id: user?.id ?? null,
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
              replies: [...(c.replies ?? []), { id: data.id, author: data.author_name, authorId: data.author_id, body: data.body, createdAt: "just now" }],
            }
          : c,
      ),
    );
    router.refresh();
  }

  const canDelete = (c: Comment) => canModerate || Boolean(user && c.authorId && c.authorId === user.id);

  async function remove(id: string) {
    setError(null);
    const { error: deleteError } = await createClient().from("comments").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setComments((prev) =>
      prev.filter((c) => c.id !== id).map((c) => ({ ...c, replies: c.replies?.filter((r) => r.id !== id) })),
    );
    router.refresh();
  }

  const visible = comments.slice(0, visibleCount);

  if (!commentsEnabled) {
    return <p className="text-sm text-muted-foreground">Comments are turned off for this issue.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {commentsRequireLogin && !isSignedIn ? (
        <p className="text-sm text-muted-foreground">Sign in to join the discussion.</p>
      ) : (
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
      )}

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
              <CommentRow key={comment.id} comment={comment} onReply={reply} canDelete={canDelete} onDelete={remove} />
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
