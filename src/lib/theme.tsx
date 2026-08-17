"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { useAuth } from "@/lib/auth";

export type ThemePreference = "system" | "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: ThemePreference) {
  const root = document.documentElement;
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile } = useAuth();
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem("theme-preference") as ThemePreference | null) ?? "system";
    setThemeState(stored);
    applyTheme(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !profile) return;
    const pref = (profile.themePreference as ThemePreference) ?? "system";
    setThemeState(pref);
    applyTheme(pref);
    localStorage.setItem("theme-preference", pref);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.themePreference, hydrated]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme("system");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [theme]);

  function setTheme(next: ThemePreference) {
    setThemeState(next);
    applyTheme(next);
    localStorage.setItem("theme-preference", next);
    if (profile) updateProfile({ themePreference: next });
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
