"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconDots, IconExternalLink, IconLink, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/icon";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type IssueLink = { id: string; label: string; url: string };

function LinkFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: IssueLink;
  onSave: (label: string, url: string) => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");

  function reset(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setLabel(initial?.label ?? "");
      setUrl(initial?.url ?? "");
    }
  }

  function save() {
    onSave(label.trim(), url.trim());
    reset(false);
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit link" : "Add link"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="link-label">Name</Label>
            <Input
              id="link-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Fundraising page"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={!label.trim() || !url.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function IssueLinksSection({
  issueId,
  initialLinks,
  canEdit,
}: {
  issueId: string;
  initialLinks?: IssueLink[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [links, setLinks] = useState<IssueLink[]>(initialLinks ?? []);
  const [addOpen, setAddOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<IssueLink | null>(null);

  async function addLink(label: string, url: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from("issue_links").insert({ issue_id: issueId, label, url }).select().single();
    if (error || !data) return;
    setLinks((prev) => [...prev, { id: data.id, label: data.label, url: data.url }]);
    router.refresh();
  }

  async function updateLink(id: string, label: string, url: string) {
    const supabase = createClient();
    const { error } = await supabase.from("issue_links").update({ label, url }).eq("id", id);
    if (error) return;
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, label, url } : l)));
    router.refresh();
  }

  async function deleteLink(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("issue_links").delete().eq("id", id);
    if (error) return;
    setLinks((prev) => prev.filter((l) => l.id !== id));
    router.refresh();
  }

  if (links.length === 0 && !canEdit) return null;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6 pb-6">
        <h3 className="font-heading text-sm font-semibold text-foreground">Links</h3>

        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground">No links added yet.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {links.map((link) => (
              <li
                key={link.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center gap-2 overflow-hidden text-sm font-medium text-primary hover:underline"
                >
                  <Icon icon={IconLink} size={14} className="shrink-0" />
                  <span className="truncate">{link.label}</span>
                  <Icon icon={IconExternalLink} size={12} className="shrink-0 text-muted-foreground" />
                </a>
                {canEdit && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        aria-label="Link options"
                      >
                        <Icon icon={IconDots} size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingLink(link)}>
                        <Icon icon={IconPencil} size={16} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onClick={() => deleteLink(link.id)}>
                        <Icon icon={IconTrash} size={16} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </li>
            ))}
          </ul>
        )}

        {canEdit && (
          <Button variant="outline" size="sm" className="w-fit" onClick={() => setAddOpen(true)}>
            <Icon icon={IconPlus} size={16} />
            Add link
          </Button>
        )}
      </CardContent>

      <LinkFormDialog open={addOpen} onOpenChange={setAddOpen} onSave={addLink} />
      {editingLink && (
        <LinkFormDialog
          open={Boolean(editingLink)}
          onOpenChange={(open) => !open && setEditingLink(null)}
          initial={editingLink}
          onSave={(label, url) => updateLink(editingLink.id, label, url)}
        />
      )}
    </Card>
  );
}
