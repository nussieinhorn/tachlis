"use client";

import { useRouter } from "next/navigation";

import { AuthGate } from "@/components/auth-gate";

/** AuthGate embedded directly in a Server Component page — refreshes the page after sign-in so the server re-fetches with the new session instead of leaving the sign-in form stuck on screen. */
export function AuthGateRefresh(props: { title?: string; description?: string }) {
  const router = useRouter();
  return <AuthGate {...props} onSignedIn={() => router.refresh()} />;
}
