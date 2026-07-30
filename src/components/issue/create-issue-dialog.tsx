"use client";

import { useState, type ReactNode } from "react";
import { IconPlus, IconCheck, IconX, IconCopy } from "@tabler/icons-react";

import { CATEGORIES, type Issue } from "@/lib/mock-data";
import { COMMUNITIES, getCommunity } from "@/lib/communities-data";
import { useAdminMode } from "@/lib/admin-mode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { CategoryTile } from "@/components/category-tile";
import { LocationSearch } from "@/components/location-search";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STEPS = ["Basics", "Description", "Team", "Review"];
const BRIEF_MAX = 140;

type TeamInvite = { id: string; name: string; phone: string; email: string; canEdit: boolean };

export function CreateIssueDialog({
  trigger,
  editIssue,
  lockedCommunityId,
}: {
  trigger: ReactNode;
  /** When provided, the dialog opens pre-filled in "edit" mode instead of blank "create" mode. */
  editIssue?: Issue;
  /** When provided (e.g. launched from a community page), the community is pre-set and can't be changed. */
  lockedCommunityId?: string;
}) {
  const { isAdmin } = useAdminMode();
  const isEditing = Boolean(editIssue);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [published, setPublished] = useState(false);
  const [copied, setCopied] = useState(false);

  const [title, setTitle] = useState(editIssue?.title ?? "");
  const [categorySlug, setCategorySlug] = useState<string>(editIssue?.categorySlug ?? CATEGORIES[0].slug);
  const [location, setLocation] = useState(editIssue?.location ?? "");
  const [communityId, setCommunityId] = useState<string | undefined>(
    lockedCommunityId ?? editIssue?.communityId,
  );
  const [goLiveDate, setGoLiveDate] = useState("");
  const [showOnHomepage, setShowOnHomepage] = useState(true);

  const [brief, setBrief] = useState(editIssue?.description ?? "");
  const [details, setDetails] = useState(editIssue?.descriptionMore ?? "");

  const [team, setTeam] = useState<TeamInvite[]>([]);

  const category = CATEGORIES.find((c) => c.slug === categorySlug) ?? CATEGORIES[0];
  const selectedCommunity = communityId ? getCommunity(communityId) : undefined;
  const fakeId = "3" + Math.floor(600 + Math.random() * 99);

  function reset(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setStep(0);
      setPublished(false);
      setTitle(editIssue?.title ?? "");
      setCategorySlug(editIssue?.categorySlug ?? CATEGORIES[0].slug);
      setLocation(editIssue?.location ?? "");
      setCommunityId(lockedCommunityId ?? editIssue?.communityId);
      setGoLiveDate("");
      setShowOnHomepage(true);
      setBrief(editIssue?.description ?? "");
      setDetails(editIssue?.descriptionMore ?? "");
      setTeam([]);
    }
  }

  function addTeamMember() {
    setTeam((prev) => [
      ...prev,
      { id: `t-${prev.length}-${Date.now()}`, name: "", phone: "", email: "", canEdit: false },
    ]);
  }

  function updateTeamMember(id: string, patch: Partial<TeamInvite>) {
    setTeam((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function removeTeamMember(id: string) {
    setTeam((prev) => prev.filter((m) => m.id !== id));
  }

  function publish() {
    // TODO(supabase): isEditing ? onUpdateIssue({ id: editIssue.id, ... }) : onCreateIssue({ ..., communityId })
    setPublished(true);
  }

  function copyLink() {
    navigator.clipboard?.writeText(`https://tachlis.org/issues/${fakeId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const canAdvance =
    (step === 0 && title.trim().length > 0) ||
    (step === 1 && brief.trim().length > 0) ||
    step === 2 ||
    step === 3;

  return (
    <Dialog open={open} onOpenChange={reset}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent
        showCloseButton={!published}
        className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-2xl"
      >
        {published ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-status-resolved/15 text-status-resolved">
              <Icon icon={IconCheck} size={28} />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center">
                {isEditing ? "Changes saved!" : "Published!"}
              </DialogTitle>
            </DialogHeader>
            <p className="max-w-sm text-sm text-muted-foreground">
              This is a static prototype, so nothing was actually saved — but here's the
              confirmation you'd see once it's live.
            </p>
            <div className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2">
              <span className="flex-1 truncate text-left text-sm text-muted-foreground">
                tachlis.org/issues/{editIssue?.id ?? fakeId}
              </span>
              <button type="button" onClick={copyLink} aria-label="Copy link">
                <Icon icon={copied ? IconCheck : IconCopy} size={16} />
              </button>
            </div>
            <Button onClick={() => reset(false)}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{STEPS[step]}</DialogTitle>
              <Progress value={((step + 1) / STEPS.length) * 100} />
              <div className="flex items-center justify-between pt-1">
                {STEPS.map((label, i) => (
                  <span
                    key={label}
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      i === step ? "font-medium text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {i < step && <Icon icon={IconCheck} size={12} className="text-status-resolved" />}
                    {label}
                  </span>
                ))}
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-1">
              {step === 0 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g. Pothole epidemic on Elm Street"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Category</Label>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {CATEGORIES.map((c) => (
                        <CategoryTile
                          key={c.slug}
                          icon={c.icon}
                          label={c.label}
                          selected={c.slug === categorySlug}
                          onClick={() => setCategorySlug(c.slug)}
                          className="px-2 py-3"
                        />
                      ))}
                      <button
                        type="button"
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-2 py-3 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <Icon icon={IconPlus} size={20} />
                        New category
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Location</Label>
                    <LocationSearch value={location} onChange={setLocation} />
                  </div>

                  {isAdmin && (
                    <div className="flex flex-col gap-1.5">
                      <Label>Community</Label>
                      {lockedCommunityId ? (
                        <div className="flex h-9 items-center rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground">
                          {getCommunity(lockedCommunityId)?.name}
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="flex h-9 items-center justify-between rounded-md border border-input px-3 text-sm text-foreground hover:bg-accent"
                            >
                              {selectedCommunity?.name ?? "Public (no community)"}
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
                            <DropdownMenuItem onClick={() => setCommunityId(undefined)}>
                              Public (no community)
                            </DropdownMenuItem>
                            {COMMUNITIES.map((c) => (
                              <DropdownMenuItem key={c.id} onClick={() => setCommunityId(c.id)}>
                                {c.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="go-live">Goes live</Label>
                      <Input
                        id="go-live"
                        type="date"
                        value={goLiveDate}
                        onChange={(e) => setGoLiveDate(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Visibility</Label>
                      <button
                        type="button"
                        onClick={() => setShowOnHomepage((v) => !v)}
                        className={cn(
                          "flex h-9 items-center gap-2 rounded-md border px-3 text-sm",
                          showOnHomepage ? "border-primary bg-accent" : "border-input",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-4 items-center justify-center rounded border",
                            showOnHomepage ? "border-primary bg-primary text-primary-foreground" : "border-border",
                          )}
                        >
                          {showOnHomepage && <Icon icon={IconCheck} size={12} />}
                        </span>
                        Show on homepage
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="brief">Brief description</Label>
                      <span className="text-xs text-muted-foreground">
                        {brief.length}/{BRIEF_MAX}
                      </span>
                    </div>
                    <Input
                      id="brief"
                      value={brief}
                      maxLength={BRIEF_MAX}
                      onChange={(e) => setBrief(e.target.value)}
                      placeholder="One or two sentences — this is what shows on the card"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>More details</Label>
                    <RichTextEditor
                      value={details}
                      onChange={setDetails}
                      placeholder="Full background, rich text — bold, lists, multiple paragraphs..."
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    Invite people to help run this issue as part of the action team.
                  </p>
                  {team.map((member) => (
                    <div key={member.id} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          Team member
                        </span>
                        <button type="button" onClick={() => removeTeamMember(member.id)} aria-label="Remove">
                          <Icon icon={IconX} size={14} className="text-muted-foreground" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <Input
                          placeholder="Name"
                          value={member.name}
                          onChange={(e) => updateTeamMember(member.id, { name: e.target.value })}
                        />
                        <Input
                          placeholder="Phone / WhatsApp"
                          value={member.phone}
                          onChange={(e) => updateTeamMember(member.id, { phone: e.target.value })}
                        />
                        <Input
                          placeholder="Email"
                          type="email"
                          value={member.email}
                          onChange={(e) => updateTeamMember(member.id, { email: e.target.value })}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-foreground">
                        <input
                          type="checkbox"
                          checked={member.canEdit}
                          onChange={(e) => updateTeamMember(member.id, { canEdit: e.target.checked })}
                          className="size-4 rounded border-border"
                        />
                        Can update this issue
                      </label>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-fit" onClick={addTeamMember}>
                    <Icon icon={IconPlus} size={16} />
                    Invite team member
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={editIssue?.status ?? "new"} />
                    <Badge variant="outline" className="gap-1">
                      <Icon icon={category.icon} size={14} />
                      {category.label}
                    </Badge>
                    {selectedCommunity && (
                      <Badge variant="secondary">{selectedCommunity.name}</Badge>
                    )}
                  </div>
                  <h3 className="font-heading text-xl leading-snug font-bold text-foreground">
                    {title || "Untitled issue"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{brief || "No description yet."}</p>
                  {location && (
                    <p className="text-xs text-muted-foreground">{location}</p>
                  )}
                  {team.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {team.length} team member{team.length > 1 ? "s" : ""} invited
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <Button variant="ghost" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button size="sm" onClick={() => setStep((s) => s + 1)} disabled={!canAdvance}>
                  Next
                </Button>
              ) : (
                <Button size="sm" onClick={publish}>
                  {isEditing ? "Save changes" : "Publish"}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
