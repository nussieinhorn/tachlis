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
  /** Emails a one-time sign-in code. Creates the account on first use; `name` only applies to a new account. */
  sendCode: (email: string, name?: string) => Promise<{ error: string | null }>;
  verifyCode: (email: string, code: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: ProfilePatch) => Promise<{ error: string | null }>;
  updateEmail: (email: string) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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

    // getSession() reads the stored session locally, so the header knows who is signed in
    // immediately instead of waiting on a network round trip to Supabase Auth.
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) loadProfile(sessionUser.id);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  async function sendCode(email: string, name?: string) {
    const supabase = createClient();
    const trimmed = email.trim();
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        shouldCreateUser: true,
        // Only used when this creates a new account; falls back to the part before the @.
        data: { name: name?.trim() || trimmed.split("@")[0] },
      },
    });
    return { error: error?.message ?? null };
  }

  async function verifyCode(email: string, code: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    await supabase.auth.getUser();
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
        sendCode,
        verifyCode,
        signOut,
        updateProfile,
        updateEmail,
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
