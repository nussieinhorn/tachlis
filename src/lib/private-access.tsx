"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type AccessRequest = { name: string; email: string };

type PrivateAccessContextValue = {
  pendingByIssue: Record<string, AccessRequest[]>;
  approvedByIssue: Record<string, string[]>;
  requestAccess: (issueId: string, name: string, email: string) => void;
  approve: (issueId: string, email: string) => void;
  approveAll: (issueId: string) => void;
  hasAccess: (issueId: string, email?: string | null) => boolean;
  hasPendingRequest: (issueId: string, email?: string | null) => boolean;
};

const PrivateAccessContext = createContext<PrivateAccessContextValue | null>(null);

// Seed a couple of fake pending requests so admin has something to approve
// without needing a second browser session.
const SEED_PENDING: Record<string, AccessRequest[]> = {
  "3661": [
    { name: "Miriam K.", email: "miriam.k@example.com" },
    { name: "Yossi K.", email: "yossi.k@example.com" },
  ],
};

export function PrivateAccessProvider({ children }: { children: ReactNode }) {
  const [pendingByIssue, setPendingByIssue] = useState<Record<string, AccessRequest[]>>(SEED_PENDING);
  const [approvedByIssue, setApprovedByIssue] = useState<Record<string, string[]>>({});

  function requestAccess(issueId: string, name: string, email: string) {
    // TODO(supabase): onRequestIssueAccess({ issueId, name, email })
    setPendingByIssue((prev) => {
      const existing = prev[issueId] ?? [];
      if (existing.some((r) => r.email === email)) return prev;
      return { ...prev, [issueId]: [...existing, { name, email }] };
    });
  }

  function approve(issueId: string, email: string) {
    // TODO(supabase): onApproveIssueAccess({ issueId, email })
    setApprovedByIssue((prev) => ({
      ...prev,
      [issueId]: [...(prev[issueId] ?? []), email],
    }));
    setPendingByIssue((prev) => ({
      ...prev,
      [issueId]: (prev[issueId] ?? []).filter((r) => r.email !== email),
    }));
  }

  function approveAll(issueId: string) {
    const requests = pendingByIssue[issueId] ?? [];
    setApprovedByIssue((prev) => ({
      ...prev,
      [issueId]: [...(prev[issueId] ?? []), ...requests.map((r) => r.email)],
    }));
    setPendingByIssue((prev) => ({ ...prev, [issueId]: [] }));
  }

  function hasAccess(issueId: string, email?: string | null) {
    if (!email) return false;
    return (approvedByIssue[issueId] ?? []).includes(email);
  }

  function hasPendingRequest(issueId: string, email?: string | null) {
    if (!email) return false;
    return (pendingByIssue[issueId] ?? []).some((r) => r.email === email);
  }

  return (
    <PrivateAccessContext.Provider
      value={{
        pendingByIssue,
        approvedByIssue,
        requestAccess,
        approve,
        approveAll,
        hasAccess,
        hasPendingRequest,
      }}
    >
      {children}
    </PrivateAccessContext.Provider>
  );
}

export function usePrivateAccess() {
  const ctx = useContext(PrivateAccessContext);
  if (!ctx) throw new Error("usePrivateAccess must be used within PrivateAccessProvider");
  return ctx;
}
