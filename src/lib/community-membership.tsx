"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type CommunityMembershipContextValue = {
  joinedIds: Set<string>;
  join: (id: string) => void;
  isJoined: (id: string) => boolean;
};

const CommunityMembershipContext = createContext<CommunityMembershipContextValue | null>(null);

export function CommunityMembershipProvider({ children }: { children: ReactNode }) {
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  function join(id: string) {
    // TODO(supabase): onJoinCommunity({ communityId: id, userId })
    setJoinedIds((prev) => new Set(prev).add(id));
  }

  function isJoined(id: string) {
    return joinedIds.has(id);
  }

  return (
    <CommunityMembershipContext.Provider value={{ joinedIds, join, isJoined }}>
      {children}
    </CommunityMembershipContext.Provider>
  );
}

export function useCommunityMembership() {
  const ctx = useContext(CommunityMembershipContext);
  if (!ctx) throw new Error("useCommunityMembership must be used within CommunityMembershipProvider");
  return ctx;
}
