"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Community } from "@/lib/communities-data";

type CreatedCommunitiesContextValue = {
  /** Communities created this session (not part of the static seed data). */
  createdCommunities: Community[];
  addCommunity: (community: Community) => void;
};

const CreatedCommunitiesContext = createContext<CreatedCommunitiesContextValue | null>(null);

export function CreatedCommunitiesProvider({ children }: { children: ReactNode }) {
  const [createdCommunities, setCreatedCommunities] = useState<Community[]>([]);

  function addCommunity(community: Community) {
    // TODO(supabase): insert into communities table with owner_id = current user
    setCreatedCommunities((prev) => [...prev, community]);
  }

  return (
    <CreatedCommunitiesContext.Provider value={{ createdCommunities, addCommunity }}>
      {children}
    </CreatedCommunitiesContext.Provider>
  );
}

export function useCreatedCommunities() {
  const ctx = useContext(CreatedCommunitiesContext);
  if (!ctx) throw new Error("useCreatedCommunities must be used within CreatedCommunitiesProvider");
  return ctx;
}
