"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

let superAdminCache: { userId: string; value: boolean } | null = null;

/** True when the signed-in person is the platform super admin. */
export function useIsSuperAdmin(): boolean {
  const { user } = useAuth();
  const [value, setValue] = useState(superAdminCache && user && superAdminCache.userId === user.id ? superAdminCache.value : false);

  useEffect(() => {
    if (!user) {
      setValue(false);
      return;
    }
    if (superAdminCache?.userId === user.id) {
      setValue(superAdminCache.value);
      return;
    }
    createClient()
      .rpc("is_super_admin")
      .then(({ data }) => {
        superAdminCache = { userId: user.id, value: Boolean(data) };
        setValue(Boolean(data));
      });
  }, [user]);

  return value;
}

/** Only an issue's or community's owner (or the super admin) may delete it; editors can change everything else. */
export function useCanDelete(ownerId?: string): boolean {
  const { user } = useAuth();
  const isSuperAdmin = useIsSuperAdmin();
  return isSuperAdmin || Boolean(user && ownerId && user.id === ownerId);
}
