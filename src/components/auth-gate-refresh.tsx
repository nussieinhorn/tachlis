"use client";

import { useRouter } from "next/navigation";

import { SignInPrompt } from "@/components/sign-in-prompt";

/** Sign-in prompt for Server Component pages: refreshes the page after sign-in so the server re-fetches with the new session. */
export function AuthGateRefresh(props: { title?: string; description?: string }) {
  const router = useRouter();
  return <SignInPrompt {...props} onSignedIn={() => router.refresh()} />;
}
