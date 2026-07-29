"use client";

import { useState } from "react";
import {
  IconLink,
  IconCheck,
  IconBrandWhatsapp,
  IconMessage,
  IconBrandFacebook,
  IconBrandX,
  IconMail,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";

const SHARE_TARGETS = [
  { label: "WhatsApp", icon: IconBrandWhatsapp, urlPrefix: "https://wa.me/?text=" },
  { label: "SMS", icon: IconMessage, urlPrefix: "sms:?body=" },
  { label: "Facebook", icon: IconBrandFacebook, urlPrefix: "https://www.facebook.com/sharer/sharer.php?u=" },
  { label: "X", icon: IconBrandX, urlPrefix: "https://twitter.com/intent/tweet?url=" },
  { label: "Email", icon: IconMail, urlPrefix: "mailto:?body=" },
];

export function SharePanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";

  function copyLink() {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this issue</DialogTitle>
          <DialogDescription>Copy the link, or share it directly.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input readOnly value={url} className="flex-1" />
          <Button variant="outline" size="icon" onClick={copyLink} aria-label="Copy link">
            <Icon icon={copied ? IconCheck : IconLink} size={16} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {SHARE_TARGETS.map((target) => (
            <a
              key={target.label}
              href={`${target.urlPrefix}${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 min-w-20 flex-col items-center gap-1.5 rounded-lg border border-border px-3 py-3 text-xs font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon icon={target.icon} size={20} />
              {target.label}
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
