"use client";

import { useMemo, useState } from "react";

import type { Community } from "@/lib/communities-data";
import { CommunityCard } from "@/components/community-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

export function CommunitiesBrowser({
  communities,
  issueCounts,
  editableIds,
}: {
  communities: Community[];
  issueCounts: Record<string, number>;
  editableIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const editableIdSet = useMemo(() => new Set(editableIds), [editableIds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return communities.filter((c) => !q || c.name.toLowerCase().includes(q));
  }, [query, communities]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Input
          placeholder="Search communities..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(PAGE_SIZE);
          }}
          className="max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No communities match your search.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                issueCount={issueCounts[community.id] ?? 0}
                canEdit={editableIdSet.has(community.id)}
              />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <Button
              variant="outline"
              className="mx-auto w-fit"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            >
              Load more
            </Button>
          )}
        </>
      )}
    </div>
  );
}
