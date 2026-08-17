"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconMoon, IconSun, IconDeviceDesktop } from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import { useTheme, type ThemePreference } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { AuthGateRefresh } from "@/components/auth-gate-refresh";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type StatusConfigRow = { key: string; label: string; color_token: string; sort_order: number };

function StatusConfigEditor({ table, title }: { table: "issue_status_config" | "solution_status_config"; title: string }) {
  const [rows, setRows] = useState<StatusConfigRow[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from(table)
      .select("key, label, color_token, sort_order")
      .order("sort_order")
      .then(({ data }) => setRows(data ?? []));
  }, [table]);

  function update(key: string, patch: Partial<StatusConfigRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  async function save(key: string) {
    const row = rows.find((r) => r.key === key);
    if (!row) return;
    setSaving(key);
    const supabase = createClient();
    await supabase.from(table).update({ label: row.label, color_token: row.color_token }).eq("key", key);
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 1500);
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border p-5">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">{title}</h2>
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-2">
            <input
              type="color"
              value={row.color_token}
              onChange={(e) => update(row.key, { color_token: e.target.value })}
              className="size-9 shrink-0 cursor-pointer rounded-md border border-input"
              aria-label={`Color for ${row.label}`}
            />
            <Input value={row.label} onChange={(e) => update(row.key, { label: e.target.value })} className="flex-1" />
            <Button size="sm" variant="outline" onClick={() => save(row.key)} disabled={saving === row.key}>
              {saved === row.key ? <Icon icon={IconCheck} size={14} /> : "Save"}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ThemeSection() {
  const { theme, setTheme } = useTheme();
  const options: { value: ThemePreference; label: string; icon: typeof IconSun }[] = [
    { value: "light", label: "Light", icon: IconSun },
    { value: "dark", label: "Dark", icon: IconMoon },
    { value: "system", label: "System", icon: IconDeviceDesktop },
  ];
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border p-5">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Appearance</h2>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm",
              theme === opt.value ? "border-primary bg-accent text-accent-foreground" : "border-border text-muted-foreground",
            )}
          >
            <Icon icon={opt.icon} size={18} />
            {opt.label}
          </button>
        ))}
      </div>
    </section>
  );
}

function EmailPreferencesSection() {
  return (
    <section className="flex flex-col gap-2 rounded-xl border border-border p-5">
      <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Email preferences</h2>
      <p className="text-sm text-muted-foreground">
        More email controls are coming here — for now, alerts follow each issue&apos;s &quot;Sign up for
        alerts&quot; subscription.
      </p>
    </section>
  );
}

export default function SettingsPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    const supabase = createClient();
    supabase.rpc("is_super_admin").then(({ data }) => setIsSuperAdmin(Boolean(data)));
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-16">
          <AuthGateRefresh title="Sign in to view settings" />
        </main>
      </>
    );
  }

  if (isSuperAdmin === false) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-lg flex-col items-center gap-3 px-6 py-20 text-center">
          <p className="text-sm text-muted-foreground">Settings are only available to the site admin.</p>
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to homepage
          </Button>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-6 py-10">
        <h1 className="font-heading text-2xl font-bold text-foreground">Settings</h1>
        <ThemeSection />
        <StatusConfigEditor table="issue_status_config" title="Issue statuses" />
        <StatusConfigEditor table="solution_status_config" title="Solution statuses" />
        <EmailPreferencesSection />
      </main>
    </>
  );
}
