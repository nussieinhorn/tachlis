"use client";

import { useMemo, useState } from "react";

import { COMMUNITIES } from "@/lib/communities-data";
import { useAdminMode } from "@/lib/admin-mode";
import { useFakeSession } from "@/lib/fake-session";
import { CommunityCard } from "@/components/community-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PAGE_SIZE = 12;

export function CommunitiesBrowser() {
  const { isAdmin } = useAdminMode();
  const { user, createdCommunities } = useFakeSession();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleCommunities = useMemo(() => {
    const all = [...COMMUNITIES, ...createdCommunities];
    return isAdmin ? all : all.filter((c) => c.privacy === "public");
  }, [isAdmin, createdCommunities]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleCommunities.filter((c) => {
      const matchesQuery = !q || c.name.toLowerCase().includes(q);
      const matchesTab = tab === "all" || c.ownerId === user?.email;
      return matchesQuery && matchesTab;
    });
  }, [query, tab, visibleCommunities, user]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as "all" | "mine");
            setVisibleCount(PAGE_SIZE);
          }}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="mine">My Communities</TabsTrigger>
          </TabsList>
        </Tabs>
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
        <p className="text-muted-foreground">
          {tab === "mine"
            ? user
              ? "You haven't created any communities yet."
              : "Sign in when creating a community to see it here."
            : "No communities match your search."}
        </p>
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
