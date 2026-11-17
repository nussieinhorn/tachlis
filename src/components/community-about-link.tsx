"use client";

import { useState } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** A small "About" link in the community heading that opens the description in a pop-up. */
export function CommunityAboutLink({ name, description }: { name: string; description: string }) {
  const [open, setOpen] = useState(false);
  if (!description.trim()) return null;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
      >
        About
      </button>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>About {name}</DialogTitle>
        </DialogHeader>
        <p className="whitespace-pre-line text-base text-muted-foreground">{description}</p>
      </DialogContent>
    </Dialog>
  );
}
