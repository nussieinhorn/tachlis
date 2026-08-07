"use client";

import { useState } from "react";
import { IconUserPlus, IconTrash } from "@tabler/icons-react";

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

type InvitedPerson = { name: string; email: string };

export function CommunityInvitePanel({ communityName }: { communityName: string }) {
  const [invited, setInvited] = useState<InvitedPerson[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function addPerson() {
    if (!name.trim() || !email.trim()) return;
    // TODO(supabase): onInvitePerson({ communityId, name, email })
    setInvited((prev) => [...prev, { name: name.trim(), email: email.trim() }]);
    setName("");
    setEmail("");
  }

  function removePerson(email: string) {
    // TODO(supabase): onRemoveInvitedPerson({ communityId, email })
    setInvited((prev) => prev.filter((p) => p.email !== email));
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
            Only invited people can see and join this private community.
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
