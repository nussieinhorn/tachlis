"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";

import { ISSUES } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";

export function SearchCombobox() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ISSUES.filter(
      (issue) =>
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full">
      <Icon
        icon={IconSearch}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        placeholder="Search issues..."
        className="pl-9 text-center"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />

      {open && query.trim() && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-lg border border-border bg-popover text-left shadow-md">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No issues found.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {results.map((issue) => (
                <li key={issue.id}>
                  <Link
                    href={`/issues/${issue.id}`}
                    className="block px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <span className="font-medium text-foreground">{issue.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
