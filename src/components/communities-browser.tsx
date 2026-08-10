"use client";

import { useMemo, useState } from "react";

import { COMMUNITIES } from "@/lib/communities-data";
import { useAdminMode } from "@/lib/admin-mode";
import { useFakeSession } from "@/lib/fake-session";
import { CommunityCard } from "@/components/community-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 12;

export function CommunitiesBrowser() {
  const { isAdmin } = useAdminMode();
  const { createdCommunities } = useFakeSession();
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleCommunities = useMemo(() => {
    const all = [...COMMUNITIES, ...createdCommunities];
    return isAdmin ? all : all.filter((c) => c.privacy === "public");
  }, [isAdmin, createdCommunities]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleCommunities.filter((c) => !q || c.name.toLowerCase().includes(q));
  }, [query, visibleCommunities]);

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
              <CommunityCard key={community.id} community={community} />
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
