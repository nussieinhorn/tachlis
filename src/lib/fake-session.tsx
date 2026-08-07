"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Community } from "@/lib/communities-data";

type FakeUser = { name: string; email: string };

type FakeSessionContextValue = {
  isSignedIn: boolean;
  user: FakeUser | null;
  signIn: (name: string, email: string) => void;
  signOut: () => void;
  /** Communities created this session by the signed-in fake user (not part of the static seed data). */
  createdCommunities: Community[];
  addCommunity: (community: Community) => void;
};

const FakeSessionContext = createContext<FakeSessionContextValue | null>(null);

export function FakeSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FakeUser | null>(null);
  const [createdCommunities, setCreatedCommunities] = useState<Community[]>([]);

  function signIn(name: string, email: string) {
    // TODO(supabase): real auth — this just simulates a session client-side
    setUser({ name, email });
  }

  function signOut() {
    setUser(null);
  }

  function addCommunity(community: Community) {
    // TODO(supabase): insert into communities table with owner_id = current user
    setCreatedCommunities((prev) => [...prev, community]);
  }

  return (
    <FakeSessionContext.Provider
      value={{
        isSignedIn: Boolean(user),
        user,
        signIn,
        signOut,
        createdCommunities,
        addCommunity,
      }}
    >
      {children}
    </FakeSessionContext.Provider>
  );
}

export function useFakeSession() {
  const ctx = useContext(FakeSessionContext);
  if (!ctx) throw new Error("useFakeSession must be used within FakeSessionProvider");
  return ctx;
}
