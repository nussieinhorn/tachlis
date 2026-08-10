"use client";

import { useState } from "react";
import {
  IconCheck,
  IconShare,
  IconHandLoveYou,
  IconHeart,
  IconHandStop,
  IconInfoCircle,
} from "@tabler/icons-react";

import { INTENT_TAGS, type IntentTag } from "@/lib/mock-data";
import { formatCompactNumber, cn } from "@/lib/utils";
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
import { SharePanel } from "@/components/issue/share-panel";

const LEVELS: {
  value: IntentTag;
  level: number;
  icon: typeof IconHeart;
  bgClass: string;
  textClass: string;
}[] = [
  {
    value: "just-support",
    level: 1,
    icon: IconHandLoveYou,
    bgClass: "bg-muted",
    textClass: "text-muted-foreground",
  },
  {
    value: "resonates",
    level: 2,
    icon: IconHeart,
    bgClass: "bg-status-traction/15",
    textClass: "text-status-traction",
  },
  {
    value: "willing-to-help",
    level: 3,
    icon: IconHandStop,
    bgClass: "bg-primary/15",
    textClass: "text-primary",
  },
];

type DialogState = "options" | "contact" | "thanks";

export function JoinPanel({
  initialSupporterCount,
  shareCount,
  visitCount,
  viewCount,
  supporterBreakdown,
}: {
  initialSupporterCount: number;
  shareCount: number;
  visitCount: number;
  viewCount: number;
  supporterBreakdown?: { justSupport: number; resonates: number; willingToHelp: number };
}) {
  const [open, setOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="font-heading text-5xl font-bold text-foreground">{supporterCount}</span>
          {supporterBreakdown && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setBreakdownOpen((v) => !v)}
                onBlur={() => setTimeout(() => setBreakdownOpen(false), 150)}
                className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Supporter breakdown"
              >
                <Icon icon={IconInfoCircle} size={16} />
              </button>
              {breakdownOpen && (
                <div className="absolute top-full left-0 z-10 mt-1 w-56 rounded-lg border border-border bg-popover p-3 text-left shadow-md">
                  <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <li className="flex items-center justify-between">
                      <span>Level 1 — just support</span>
                      <span className="font-medium text-foreground">{supporterBreakdown.justSupport}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Level 2 — resonates</span>
                      <span className="font-medium text-foreground">{supporterBreakdown.resonates}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Level 3 — willing to help</span>
                      <span className="font-medium text-foreground">{supporterBreakdown.willingToHelp}</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        <span className="text-sm text-muted-foreground">supporters</span>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
        <span>{formatCompactNumber(shareCount)} shares</span>
        <span>{formatCompactNumber(visitCount)} visits</span>
        <span>{formatCompactNumber(viewCount)} views</span>
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
              <div className="flex flex-col gap-3">
                {LEVELS.map((level) => {
                  const tag = INTENT_TAGS.find((t) => t.value === level.value)!;
                  return (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => chooseOption(level.value)}
                      className="flex w-full items-center gap-4 rounded-xl border-2 border-border px-5 py-5 text-left transition-colors hover:border-primary hover:bg-accent"
                    >
                      <span
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-full",
                          level.bgClass,
                          level.textClass,
                        )}
                      >
                        <Icon icon={level.icon} size={22} />
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <span className={cn("text-xs font-semibold tracking-wide uppercase", level.textClass)}>
                          Level {level.level}
                        </span>
                        <span className="text-base font-medium text-foreground">{tag.label}</span>
                      </div>
                    </button>
                  );
                })}
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
