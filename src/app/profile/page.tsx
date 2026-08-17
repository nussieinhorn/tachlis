"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import { isValidEmail } from "@/lib/format";
import { SiteHeader } from "@/components/site-header";
import { AuthGateRefresh } from "@/components/auth-gate-refresh";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ProfilePage() {
  const { isSignedIn, profile, updateProfile, updateEmail, updatePassword, deleteAccount, signOut } = useAuth();
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
      <main className="mx-auto flex w-full max-w-lg flex-col gap-8 px-6 py-10">
        <h1 className="font-heading text-2xl font-bold text-foreground">Profile</h1>

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
      </main>
    </>
  );
}
