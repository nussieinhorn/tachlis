"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function IssueDescription({
  description,
  descriptionMore,
}: {
  description: string;
  descriptionMore?: string;
}) {
  const [open, setOpen] = useState(false);
  const paragraphs = descriptionMore?.split("\n\n") ?? [];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg leading-relaxed text-foreground/80">{description}</p>
      {descriptionMore && (
        <>
          <Button variant="link" className="w-fit px-0" onClick={() => setOpen(true)}>
            Read more
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>More background</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="flex flex-col gap-4">
                  {paragraphs.map((paragraph, i) => (
                    <p key={i} className="text-foreground/80 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
