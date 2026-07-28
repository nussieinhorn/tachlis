"use client";

import { useState } from "react";

import type { Comment } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function Discussion({ initialComments }: { initialComments: Comment[] }) {
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");

  function post() {
    if (!draft.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: `local-${prev.length}`, author: "You", body: draft.trim(), createdAt: "just now" },
    ]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-4">
      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No discussion yet — be the first to say something.</p>
      ) : (
        <ul className="flex flex-col gap-4">
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

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <Textarea
          placeholder="Add to the discussion..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button size="sm" className="w-fit" onClick={post} disabled={!draft.trim()}>
          Post
        </Button>
      </div>
    </div>
  );
}
