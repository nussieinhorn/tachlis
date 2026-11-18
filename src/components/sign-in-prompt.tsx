"use client";

import { useState } from "react";
import { IconLogin } from "@tabler/icons-react";

import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/**
 * Where a page needs a signed-in person: a short message and a Sign in button.
 * The sign-in form itself always opens in a pop-up (a bottom drawer on phones), never inline on the page.
 */
export function SignInPrompt({
  title = "Sign in to continue",
  description = "You'll need an account to continue.",
  onSignedIn,
}: {
  title?: string;
  description?: string;
  onSignedIn?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 py-10 text-center">
      <div className="flex flex-col gap-2">
        <h2 className="type-dialog">{title}</h2>
        <p className="text-base text-muted-foreground">{description}</p>
      </div>
      <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
        <Icon icon={IconLogin} size={18} />
        Sign in
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="sr-only">{title}</DialogTitle>
          </DialogHeader>
          <AuthGate
            title={title}
            description={description}
            onSignedIn={() => {
              setOpen(false);
              onSignedIn?.();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
