"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconUserPlus, IconTrash } from "@tabler/icons-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type InvitedPerson = { name: string; email: string; found: boolean };

export function CommunityInvitePanel({ communityId, communityName }: { communityId: string; communityName: string }) {
  const router = useRouter();
  const [invited, setInvited] = useState<InvitedPerson[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function addPerson() {
    if (!name.trim() || !email.trim()) return;
    setError(null);
    const supabase = createClient();
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", email.trim()).maybeSingle();
    if (!profile) {
      setError(`No Tachlis account found for ${email.trim()} yet — they'll need to sign up first.`);
      return;
    }
    const { error: insertError } = await supabase
      .from("community_editors")
      .insert({ community_id: communityId, user_id: profile.id });
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setInvited((prev) => [...prev, { name: name.trim(), email: email.trim(), found: true }]);
    setName("");
    setEmail("");
    router.refresh();
  }

  async function removePerson(personEmail: string) {
    const supabase = createClient();
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", personEmail).maybeSingle();
    if (profile) {
      await supabase.from("community_editors").delete().eq("community_id", communityId).eq("user_id", profile.id);
    }
    setInvited((prev) => prev.filter((p) => p.email !== personEmail));
    router.refresh();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Icon icon={IconUserPlus} size={16} />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite people to {communityName}</DialogTitle>
          <DialogDescription>
            Grants edit access. They&apos;ll need an existing Tachlis account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <Button type="button" onClick={addPerson}>
              Add
            </Button>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {invited.length > 0 && (
            <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
              {invited.map((person) => (
                <li key={person.email} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium text-foreground">{person.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{person.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePerson(person.email)}
                    className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
                    aria-label={`Remove ${person.name}`}
                  >
                    <Icon icon={IconTrash} size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
