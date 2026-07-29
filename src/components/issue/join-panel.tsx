"use client";

import { useState } from "react";
import { IconCheck, IconShare } from "@tabler/icons-react";

import { INTENT_TAGS, type IntentTag } from "@/lib/mock-data";
import { formatCompactNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { SharePanel } from "@/components/issue/share-panel";

export function JoinPanel({
  initialSupporterCount,
  shareCount,
}: {
  initialSupporterCount: number;
  shareCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [supported, setSupported] = useState(false);
  const [selectedTags, setSelectedTags] = useState<IntentTag[]>([]);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [supporterCount, setSupporterCount] = useState(initialSupporterCount);

  function toggleTag(tag: IntentTag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  function onSubmitSupport() {
    // TODO(supabase): onSupportIssue({ issueId, tags: selectedTags, comment, email, phone })
    setSupported(true);
    setSupporterCount((c) => c + 1);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-heading text-2xl font-bold text-foreground">{supporterCount}</span>
          <span className="text-xs text-muted-foreground">Supports</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-heading text-2xl font-bold text-foreground">
            {formatCompactNumber(shareCount)}
          </span>
          <span className="text-xs text-muted-foreground">Shares</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="lg"
          variant={supported ? "secondary" : "default"}
          className="h-11 flex-1 text-base"
          onClick={() => (supported ? undefined : setOpen(true))}
        >
          <Icon icon={IconCheck} className={cn(!supported && "hidden")} />
          {supported ? "Supporting" : "Support"}
        </Button>
        <Button size="lg" variant="outline" className="h-11 flex-1 text-base" onClick={() => setShareOpen(true)}>
          <Icon icon={IconShare} />
          Share
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Show your support</DialogTitle>
            <DialogDescription>
              Pick what applies — no account needed to support this issue.
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

          <Textarea
            placeholder="Add a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-16"
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Phone (optional)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              onClick={onSubmitSupport}
              disabled={selectedTags.length === 0 || !email.trim()}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SharePanel open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}
