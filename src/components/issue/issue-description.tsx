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

  return (
    <div className="flex flex-col gap-3">
      <p className="text-lg leading-relaxed text-foreground/80">{description}</p>
      {descriptionMore && (
        <>
          <Button variant="link" className="w-fit px-0" onClick={() => setOpen(true)}>
            Read more
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>More background</DialogTitle>
              </DialogHeader>
              <p className="text-foreground/80 leading-relaxed">{descriptionMore}</p>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
