import Link from "next/link";
import { IconSearch, IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-6 py-4">
        <Link href="/" className="font-heading text-xl font-bold text-foreground">
          Tachlis
        </Link>

        <div className="relative ml-4 hidden max-w-sm flex-1 sm:block">
          <Icon
            icon={IconSearch}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input placeholder="Search issues..." className="pl-9" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/solved">Solved archive</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/issues/new">
              <Icon icon={IconPlus} />
              Start your own
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
