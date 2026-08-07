"use client";

import { useState } from "react";
import { IconBrandGoogleFilled } from "@tabler/icons-react";

import { useFakeSession } from "@/lib/fake-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AuthGate({
  title = "Sign in to continue",
  description = "This is a simulated account for the prototype — nothing is sent anywhere.",
}: {
  title?: string;
  description?: string;
}) {
  const { signIn } = useFakeSession();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = email.trim() && password.trim() && (tab === "signin" || name.trim());

  function submit() {
    if (!canSubmit) return;
    // TODO(supabase): real auth — this just simulates a session client-side
    signIn(name.trim() || email.split("@")[0], email.trim());
  }

  function continueWithGoogle() {
    // TODO(supabase): real Google OAuth
    signIn("Google User", "google.user@example.com");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Button variant="outline" type="button" onClick={continueWithGoogle} className="gap-2">
        <Icon icon={IconBrandGoogleFilled} size={16} />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
        <TabsList className="w-full">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Sign up</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="mt-4 flex flex-col gap-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="button" disabled={!canSubmit} onClick={submit}>
            Sign in
          </Button>
        </TabsContent>

        <TabsContent value="signup" className="mt-4 flex flex-col gap-3">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="button" disabled={!canSubmit} onClick={submit}>
            Create account
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
