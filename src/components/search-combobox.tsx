"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";

import { ISSUES } from "@/lib/mock-data";
import { COMMUNITIES } from "@/lib/communities-data";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";

export function SearchCombobox() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const issueResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ISSUES.filter(
      (issue) =>
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q),
    ).slice(0, 4);
  }, [query]);

  const communityResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return COMMUNITIES.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 3);
  }, [query]);

  const hasResults = issueResults.length > 0 || communityResults.length > 0;

  return (
    <div className="relative w-full max-w-xs">
      <Icon
        icon={IconSearch}
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        placeholder="Search..."
        className="pl-9 text-left"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />

      {open && query.trim() && (
        <div className="absolute top-full left-0 z-50 mt-2 w-full min-w-72 rounded-lg border border-border bg-popover text-left shadow-md">
          {!hasResults ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">No results found.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {issueResults.length > 0 && (
                <div>
                  <p className="px-4 pt-2.5 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Issues
                  </p>
                  <ul className="flex flex-col">
                    {issueResults.map((issue) => (
                      <li key={issue.id}>
                        <Link
                          href={`/issues/${issue.id}`}
                          className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                          <span className="font-medium text-foreground">{issue.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {communityResults.length > 0 && (
                <div>
                  <p className="px-4 pt-2.5 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Communities
                  </p>
                  <ul className="flex flex-col pb-1">
                    {communityResults.map((community) => (
                      <li key={community.id}>
                        <Link
                          href={`/communities/${community.id}`}
                          className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                        >
                          <span className="font-medium text-foreground">{community.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
