import Link from "next/link";

import { MotiveMark } from "@/components/motive-logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 sm:px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2">
          <MotiveMark className="size-5 text-foreground" />
          <span>&copy; {new Date().getFullYear()} Motive. All rights reserved.</span>
        </p>
        <nav aria-label="Legal" className="flex items-center gap-5">
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <a href="mailto:admin@tachlis.org" className="transition-colors hover:text-foreground">
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
