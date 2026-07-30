"use client";

import { useState } from "react";
import {
  IconCheck,
  IconShare,
  IconHandLoveYou,
  IconHeart,
  IconHandStop,
  IconBellRinging,
} from "@tabler/icons-react";

import { INTENT_TAGS, type IntentTag } from "@/lib/mock-data";
import { formatCompactNumber } from "@/lib/utils";
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
import { cn } from "@/lib/utils";
import { SharePanel } from "@/components/issue/share-panel";

const OPTION_ICONS: Record<IntentTag, typeof IconHeart> = {
  "just-support": IconHandLoveYou,
  resonates: IconHeart,
  "willing-to-help": IconHandStop,
  "stay-updated": IconBellRinging,
};

type DialogState = "options" | "contact" | "thanks";

export function JoinPanel({
  initialSupporterCount,
  shareCount,
  visitCount,
  viewCount,
}: {
  initialSupporterCount: number;
  shareCount: number;
  visitCount: number;
  viewCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [supported, setSupported] = useState(false);
  const [dialogState, setDialogState] = useState<DialogState>("options");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [supporterCount, setSupporterCount] = useState(initialSupporterCount);

  function chooseOption(tag: IntentTag) {
    // TODO(supabase): onSupportIssue({ issueId, tag })
    setSupported(true);
    setSupporterCount((c) => c + 1);

    if (tag === "willing-to-help") {
      setDialogState("contact");
      return;
    }

    setDialogState("thanks");
    setTimeout(() => setOpen(false), 1500);
  }

  function completeContact() {
    // TODO(supabase): onSupportIssueContact({ issueId, name, email, phone })
    setDialogState("thanks");
    setTimeout(() => setOpen(false), 1500);
  }

  function resetDialog(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTimeout(() => {
        setDialogState("options");
        setName("");
        setEmail("");
        setPhone("");
      }, 200);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col">
        <span className="font-heading text-4xl font-bold text-foreground">{supporterCount}</span>
        <span className="text-sm text-muted-foreground">supporters</span>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatCompactNumber(shareCount)} shares</span>
          <span>{formatCompactNumber(visitCount)} visits</span>
          <span>{formatCompactNumber(viewCount)} views</span>
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

      <Dialog open={open} onOpenChange={resetDialog}>
        <DialogContent>
          {dialogState === "options" && (
            <>
              <DialogHeader>
                <DialogTitle>Show your support</DialogTitle>
                <DialogDescription>Pick whichever fits — one click, no account needed.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {INTENT_TAGS.map((tag) => (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => chooseOption(tag.value)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border px-4 py-6 text-center transition-colors hover:border-primary hover:bg-accent"
                  >
                    <Icon icon={OPTION_ICONS[tag.value]} size={28} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">{tag.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {dialogState === "contact" && (
            <>
              <DialogHeader>
                <DialogTitle>How can we reach you?</DialogTitle>
                <DialogDescription>
                  Leave your info and organizers will follow up about how to help.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
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
                <Button onClick={completeContact} disabled={!name.trim() || !email.trim()}>
                  Complete
                </Button>
              </DialogFooter>
            </>
          )}

          {dialogState === "thanks" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-status-resolved/15 text-status-resolved">
                <Icon icon={IconCheck} size={28} />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">Thank you for your support!</DialogTitle>
              </DialogHeader>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <SharePanel open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}
