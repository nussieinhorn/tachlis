"use client";

import { useState } from "react";
import { IconArrowUp, IconCheck } from "@tabler/icons-react";

import { INTENT_TAGS, type IntentTag } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function JoinPanel({ initialSupporterCount }: { initialSupporterCount: number }) {
  const [open, setOpen] = useState(false);
  const [joined, setJoined] = useState(false);
  const [voted, setVoted] = useState(false);
  const [selectedTags, setSelectedTags] = useState<IntentTag[]>([]);
  const [supporterCount, setSupporterCount] = useState(initialSupporterCount);

  function toggleTag(tag: IntentTag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function confirmJoin() {
    setJoined(true);
    setOpen(false);
  }

  function castVote() {
    if (voted) return;
    setVoted(true);
    setSupporterCount((c) => c + 1);
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        <strong className="text-foreground">{supporterCount}</strong> supporters
      </span>

      {!joined ? (
        <>
          <Button onClick={() => setOpen(true)}>Join</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>What brings you here?</DialogTitle>
                <DialogDescription>
                  Pick what applies — this helps organizers know who to reach out to.
                  You'll need to join before you can vote.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                {INTENT_TAGS.map((tag) => {
                  const active = selectedTags.includes(tag.value);
                  return (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => toggleTag(tag.value)}
                      className={cn(
                        "flex items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                        active && "border-primary bg-accent text-accent-foreground",
                      )}
                    >
                      {tag.label}
                      {active && <Icon icon={IconCheck} size={16} className="text-primary" />}
                    </button>
                  );
                })}
              </div>
              <DialogFooter>
                <Button onClick={confirmJoin} disabled={selectedTags.length === 0}>
                  Join this issue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Button variant={voted ? "secondary" : "default"} onClick={castVote}>
          <Icon icon={voted ? IconCheck : IconArrowUp} />
          {voted ? "Supporting" : "Support this"}
        </Button>
      )}
    </div>
  );
}
