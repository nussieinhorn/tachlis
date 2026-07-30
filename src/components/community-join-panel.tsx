"use client";

import { useState } from "react";
import { IconCheck, IconCopy } from "@tabler/icons-react";

import { useCommunityMembership } from "@/lib/community-membership";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";

export function CommunityJoinPanel({ communityId, communityName }: { communityId: string; communityName: string }) {
  const { isJoined, join } = useCommunityMembership();
  const [open, setOpen] = useState(false);
  const [joined, setJoinedLocal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const alreadyJoined = isJoined(communityId) || joined;
  const link = typeof window !== "undefined" ? window.location.href : `https://tachlis.org/communities/${communityId}`;

  function submit() {
    join(communityId);
    setJoinedLocal(true);
  }

  function copyLink() {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (alreadyJoined) {
    return (
      <Button size="lg" variant="secondary" disabled className="gap-2">
        <Icon icon={IconCheck} size={16} />
        Joined
      </Button>
    );
  }

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        Join
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {joined ? (
            <>
              <DialogHeader>
                <DialogTitle>You&apos;re in!</DialogTitle>
                <DialogDescription>
                  Here&apos;s a link to share or come back to {communityName}.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                <span className="flex-1 truncate text-sm text-muted-foreground">{link}</span>
                <button type="button" onClick={copyLink} aria-label="Copy link">
                  <Icon icon={copied ? IconCheck : IconCopy} size={16} />
                </button>
              </div>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Request to join {communityName}</DialogTitle>
                <DialogDescription>Just your name and email — no account needed.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button onClick={submit} disabled={!name.trim() || !email.trim()}>
                  Request to join
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
