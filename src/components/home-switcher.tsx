"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const VIEWS = [
  { key: "dashboard", label: "My dashboard", href: "/" },
  { key: "public", label: "Public home", href: "/?view=home" },
] as const;

/** Lets a signed-in person flip between their dashboard and the public homepage. The pill flips the instant you click. */
export function HomeSwitcher({ active }: { active: "dashboard" | "public" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState(active);

  // Warm both views so the click mostly just swaps what's already fetched.
  useEffect(() => {
    VIEWS.forEach((v) => router.prefetch(v.href));
  }, [router]);

  useEffect(() => setOptimistic(active), [active]);

  return (
    <div className="mx-auto flex w-full max-w-6xl justify-end px-6 pt-5">
      <nav aria-label="Home view" className="inline-flex gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
        {VIEWS.map((v) => {
          const on = optimistic === v.key;
          return (
            <a
              key={v.key}
              href={v.href}
              aria-current={on ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                if (v.key === optimistic) return;
                setOptimistic(v.key);
                startTransition(() => router.push(v.href));
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                on ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {on && pending && <Icon icon={IconLoader2} size={14} className="animate-spin" />}
              {v.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
