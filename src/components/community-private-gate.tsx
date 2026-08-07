"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAdminMode } from "@/lib/admin-mode";

export function CommunityPrivateGate({
  isPrivate,
  children,
}: {
  isPrivate: boolean;
  children: React.ReactNode;
}) {
  const { isAdmin } = useAdminMode();
  const router = useRouter();
  const blocked = isPrivate && !isAdmin;

  useEffect(() => {
    if (blocked) router.replace("/");
  }, [blocked, router]);

  if (blocked) return null;
  return <>{children}</>;
}
