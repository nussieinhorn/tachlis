"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconMoon, IconSun, IconDeviceDesktop } from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import { useTheme, type ThemePreference } from "@/lib/theme";
import { isValidEmail } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { AuthGateRefresh } from "@/components/auth-gate-refresh";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const NOTIFICATION_EVENTS: { type: string; label: string; description: string }[] = [
  { type: "update_posted", label: "Updates posted", description: "An admin posts an update on an issue you support." },
  { type: "solution_chosen", label: "Solution chosen", description: "A solution is marked chosen on an issue you support." },
  { type: "status_changed", label: "Status changes", description: "An issue's status changes." },
  { type: "solution_suggested", label: "New solutions suggested", description: "Someone suggests a new solution." },
];

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

function NotificationsSection() {
  const { profile, updateProfile } = useAuth();
  const [notifyTypes, setNotifyTypes] = useState<string[]>(profile?.notifyTypes ?? []);
  const [emailNotifyTypes, setEmailNotifyTypes] = useState<string[]>(profile?.emailNotifyTypes ?? []);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setNotifyTypes(profile.notifyTypes);
    setEmailNotifyTypes(profile.emailNotifyTypes);
  }, [profile]);

  function toggleNotify(type: string) {
    setNotifyTypes((prev) => {
      const next = prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type];
      if (!next.includes(type)) setEmailNotifyTypes((e) => e.filter((t) => t !== type));
      return next;
    });
  }

  function toggleEmail(type: string) {
    setEmailNotifyTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }

  async function save() {
    setSubmitting(true);
    await updateProfile({ notifyTypes, emailNotifyTypes });
    setSubmitting(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Notifications</h2>
        <p className="text-xs text-muted-foreground">
          Choose what shows up in your notifications inbox, and which of those should also email you.
        </p>
      </div>
      <div className="flex flex-col divide-y divide-border">
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 pb-2 text-xs font-medium text-muted-foreground">
          <span />
          <span>Notify me</span>
          <span>Also email</span>
        </div>
        {NOTIFICATION_EVENTS.map((event) => {
          const notifyOn = notifyTypes.includes(event.type);
          const emailOn = emailNotifyTypes.includes(event.type);
          return (
            <div key={event.type} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{event.label}</span>
                <span className="text-xs text-muted-foreground">{event.description}</span>
              </div>
              <input
                type="checkbox"
                checked={notifyOn}
                onChange={() => toggleNotify(event.type)}
                className="size-4 rounded border-border"
                aria-label={`Notify me: ${event.label}`}
              />
              <input
                type="checkbox"
                checked={emailOn}
                disabled={!notifyOn}
                onChange={() => toggleEmail(event.type)}
                className="size-4 rounded border-border disabled:opacity-30"
                aria-label={`Email me: ${event.label}`}
              />
            </div>
          );
        })}
      </div>
      <Button size="sm" className="w-fit" onClick={save} disabled={submitting}>
        {saved ? (
          <>
            <Icon icon={IconCheck} size={14} />
            Saved
          </>
        ) : (
          "Save preferences"
        )}
      </Button>
    </section>
  );
}

function MyProfileSection() {
  const { profile, updateProfile, updateEmail, updatePassword, deleteAccount, signOut } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setPhone(profile.phone ?? "");
    setEmail(profile.email);
  }, [profile]);

  async function saveProfile() {
    setError(null);
    setSubmitting(true);
    const { error: err } = await updateProfile({ name: name.trim(), phone: phone.trim() || undefined });
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  async function saveEmail() {
    setError(null);
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setSubmitting(true);
    const { error: err } = await updateEmail(email.trim());
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    setEmailSaved(true);
  }

  async function savePassword() {
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    const { error: err } = await updatePassword(password);
    setSubmitting(false);
    if (err) {
      setError(err);
      return;
    }
    setPassword("");
    setConfirmPassword("");
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2000);
  }

  async function handleDelete() {
    const { error: err } = await deleteAccount();
    if (!err) {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <p className="text-sm text-destructive">{error}</p>}

      <section className="flex flex-col gap-3 rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Name &amp; phone</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-name">Name</Label>
          <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-phone">Phone (optional)</Label>
          <Input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <Button size="sm" className="w-fit" onClick={saveProfile} disabled={submitting || !name.trim()}>
          {profileSaved ? (
            <>
              <Icon icon={IconCheck} size={14} />
              Saved
            </>
          ) : (
            "Save"
          )}
        </Button>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Email</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-email">Email address</Label>
          <Input id="profile-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        {emailSaved ? (
          <p className="text-sm text-muted-foreground">
            Check your inbox — confirm the change from the link we sent to your new address.
          </p>
        ) : (
          <Button size="sm" className="w-fit" onClick={saveEmail} disabled={submitting || email === profile?.email}>
            Update email
          </Button>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border p-5">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Password</h2>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-password">New password</Label>
          <Input id="profile-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-password-confirm">Confirm new password</Label>
          <Input
            id="profile-password-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <Button size="sm" className="w-fit" onClick={savePassword} disabled={submitting || !password}>
          {passwordSaved ? (
            <>
              <Icon icon={IconCheck} size={14} />
              Updated
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h2 className="text-sm font-semibold tracking-wide text-destructive uppercase">Danger zone</h2>
        <p className="text-sm text-muted-foreground">
          Deleting your account is permanent — your issues and solutions stay, but you&apos;ll lose access to
          everything tied to this login.
        </p>
        <ConfirmDialog
          title="Delete your account?"
          description="This can't be undone. You'll be signed out immediately."
          confirmLabel="Delete account"
          onConfirm={handleDelete}
          trigger={
            <Button variant="destructive" size="sm" className="w-fit">
              Delete account
            </Button>
          }
        />
      </section>

      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        onClick={async () => {
          await signOut();
          router.push("/");
          router.refresh();
        }}
      >
        Sign out
      </Button>
    </div>
  );
}

export default function ProfilePage() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-sm flex-col gap-6 px-6 py-16">
          <AuthGateRefresh title="Sign in to view your profile" />
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-10">
        <h1 className="font-heading text-2xl font-bold text-foreground">Profile</h1>

        <Tabs defaultValue="profile">
          <TabsList className="w-full">
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="pt-4">
            <MyProfileSection />
          </TabsContent>
          <TabsContent value="preferences" className="flex flex-col gap-6 pt-4">
            <ThemeSection />
            <NotificationsSection />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
