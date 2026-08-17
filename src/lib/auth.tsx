"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  themePreference: string;
  notifyTypes: string[];
  emailNotifyTypes: string[];
};

type ProfilePatch = {
  name?: string;
  phone?: string;
  themePreference?: string;
  notifyTypes?: string[];
  emailNotifyTypes?: string[];
};

type AuthContextValue = {
  isSignedIn: boolean;
  loading: boolean;
  user: User | null;
  profile: Profile | null;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (patch: ProfilePatch) => Promise<{ error: string | null }>;
  updateEmail: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** "Remember me" unchecked: rewrite the just-issued Supabase session cookie(s) as session-only (no Max-Age), so they clear on browser close instead of persisting for 400 days. */
function downgradeAuthCookiesToSessionOnly() {
  if (typeof document === "undefined") return;
  const names = document.cookie
    .split(";")
    .map((c) => c.split("=")[0].trim())
    .filter((name) => name.startsWith("sb-") && name.includes("-auth-token"));
  for (const name of names) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    if (!match) continue;
    document.cookie = `${name}=${match[1]}; path=/; SameSite=Lax`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("id, name, email, phone, theme_preference, notify_types, email_notify_types")
        .eq("id", userId)
        .single();
      setProfile(
        data
          ? {
              id: data.id,
              name: data.name,
              email: data.email,
              phone: data.phone,
              themePreference: data.theme_preference,
              notifyTypes: data.notify_types,
              emailNotifyTypes: data.email_notify_types,
            }
          : null,
      );
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) loadProfile(data.user.id);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function signUp(name: string, email: string, password: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    return { error: error?.message ?? null };
  }

  async function signIn(email: string, password: string, rememberMe = true) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      // Force a fresh round-trip rather than trusting a cached session from a previous account in this tab.
      await supabase.auth.getUser();
      if (!rememberMe) downgradeAuthCookiesToSessionOnly();
    }
    return { error: error?.message ?? null };
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    await supabase.auth.getUser();
  }

  async function resetPassword(email: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/auth/reset-password`,
    });
    return { error: error?.message ?? null };
  }

  async function updateProfile(patch: ProfilePatch) {
    if (!user) return { error: "Not signed in" };
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.phone !== undefined && { phone: patch.phone }),
        ...(patch.themePreference !== undefined && { theme_preference: patch.themePreference }),
        ...(patch.notifyTypes !== undefined && { notify_types: patch.notifyTypes }),
        ...(patch.emailNotifyTypes !== undefined && { email_notify_types: patch.emailNotifyTypes }),
      })
      .eq("id", user.id);
    if (!error) setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
    return { error: error?.message ?? null };
  }

  async function updateEmail(email: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ email });
    return { error: error?.message ?? null };
  }

  async function updatePassword(password: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  }

  async function deleteAccount() {
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_own_account");
    if (!error) await supabase.auth.signOut();
    return { error: error?.message ?? null };
  }

  return (
    <AuthContext.Provider
      value={{
        isSignedIn: Boolean(user),
        loading,
        user,
        profile,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        updateEmail,
        updatePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
