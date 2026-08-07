"use client";

import { useState, type ReactNode } from "react";
import { IconCheck, IconX, IconCopy, IconPlus, IconChevronDown } from "@tabler/icons-react";

import { CATEGORIES, type Issue } from "@/lib/mock-data";
import { COMMUNITIES, getCommunity, getCommunitiesOwnedBy, type Community } from "@/lib/communities-data";
import { useAdminMode } from "@/lib/admin-mode";
import { useFakeSession } from "@/lib/fake-session";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { LocationSearch } from "@/components/location-search";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
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

const STEPS = ["Basic info", "Settings", "Team", "Review"];

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
  const { isSignedIn, user, createdCommunities } = useFakeSession();
  const isEditing = Boolean(editIssue);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [published, setPublished] = useState(false);
  const [copied, setCopied] = useState(false);

  const [title, setTitle] = useState(editIssue?.title ?? "");
  const [description, setDescription] = useState(editIssue?.description ?? "");
  const [categorySlug, setCategorySlug] = useState<string>(editIssue?.categorySlug ?? CATEGORIES[0].slug);
  const [location, setLocation] = useState(editIssue?.location ?? "");

  const [communityMode, setCommunityMode] = useState<"standalone" | "community">(
    (lockedCommunityId ?? editIssue?.communityId) ? "community" : "standalone",
  );
  const [communityId, setCommunityId] = useState<string | undefined>(
    lockedCommunityId ?? editIssue?.communityId,
  );

  const [visibility, setVisibility] = useState<"public" | "private">(editIssue?.visibility ?? "public");
  const [showOnHomepage, setShowOnHomepage] = useState(editIssue?.showOnHomepage ?? true);
  const [showInSearch, setShowInSearch] = useState(editIssue?.showInSearch ?? true);
  const [supportRequiresLogin, setSupportRequiresLogin] = useState(editIssue?.supportRequiresLogin ?? false);
  const [voteRequiresLogin, setVoteRequiresLogin] = useState(editIssue?.voteRequiresLogin ?? false);
  const [allowSuggestSolutions, setAllowSuggestSolutions] = useState(editIssue?.allowSuggestSolutions ?? true);
  const [goLiveDate, setGoLiveDate] = useState(editIssue?.goLiveDate ?? "");
  const [votingCloseDate, setVotingCloseDate] = useState(editIssue?.votingCloseDate ?? "");
  const [hiddenDate, setHiddenDate] = useState(editIssue?.hiddenDate ?? "");

  const [team, setTeam] = useState<TeamInvite[]>([]);

  const category = CATEGORIES.find((c) => c.slug === categorySlug) ?? CATEGORIES[0];
  const fakeId = "3" + Math.floor(600 + Math.random() * 99);

  const ownedCommunities: Community[] = [
    ...getCommunitiesOwnedBy(user?.email ?? ""),
    ...createdCommunities.filter((c) => c.ownerId === user?.email),
  ];
  const selectableCommunities = isAdmin ? [...COMMUNITIES, ...createdCommunities] : ownedCommunities;
  const selectedCommunity = communityId
    ? (getCommunity(communityId) ?? selectableCommunities.find((c) => c.id === communityId))
    : undefined;

  const showAuthGate = !isEditing && !isAdmin && !isSignedIn;

  function reset(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setStep(0);
      setPublished(false);
      setTitle(editIssue?.title ?? "");
      setDescription(editIssue?.description ?? "");
      setCategorySlug(editIssue?.categorySlug ?? CATEGORIES[0].slug);
      setLocation(editIssue?.location ?? "");
      setCommunityMode((lockedCommunityId ?? editIssue?.communityId) ? "community" : "standalone");
      setCommunityId(lockedCommunityId ?? editIssue?.communityId);
      setVisibility(editIssue?.visibility ?? "public");
      setShowOnHomepage(editIssue?.showOnHomepage ?? true);
      setShowInSearch(editIssue?.showInSearch ?? true);
      setSupportRequiresLogin(editIssue?.supportRequiresLogin ?? false);
      setVoteRequiresLogin(editIssue?.voteRequiresLogin ?? false);
      setAllowSuggestSolutions(editIssue?.allowSuggestSolutions ?? true);
      setGoLiveDate(editIssue?.goLiveDate ?? "");
      setVotingCloseDate(editIssue?.votingCloseDate ?? "");
      setHiddenDate(editIssue?.hiddenDate ?? "");
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
    // TODO(supabase): isEditing ? onUpdateIssue({ id: editIssue.id, ... }) : onCreateIssue({ ..., communityId, visibility, ... })
    setPublished(true);
  }

  function copyLink() {
    navigator.clipboard?.writeText(`https://tachlis.org/issues/${fakeId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const canAdvance =
    (step === 0 && title.trim().length > 0 && description.trim().length > 0) ||
    (step === 1 && (communityMode === "standalone" || Boolean(communityId))) ||
    step === 2 ||
    step === 3;

  const basicInfoFields = (
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue — what's going on, who it affects, why it matters..."
          className="min-h-32"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Category</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-9 items-center justify-between gap-2 rounded-md border border-input px-3 text-sm text-foreground hover:bg-accent"
            >
              <span className="flex items-center gap-2">
                <Icon icon={category.icon} size={16} />
                {category.label}
              </span>
              <Icon icon={IconChevronDown} size={14} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
            {CATEGORIES.map((c) => (
              <DropdownMenuItem key={c.slug} onClick={() => setCategorySlug(c.slug)}>
                <Icon icon={c.icon} size={16} />
                {c.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Location (optional)</Label>
        <LocationSearch value={location} onChange={setLocation} />
      </div>
    </div>
  );

  const settingsFields = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label>Community</Label>
        {lockedCommunityId ? (
          <div className="flex h-9 items-center rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground">
            {getCommunity(lockedCommunityId)?.name}
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCommunityMode("standalone")}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm",
                  communityMode === "standalone" ? "border-primary bg-accent" : "border-input",
                )}
              >
                Standalone
              </button>
              <button
                type="button"
                onClick={() => setCommunityMode("community")}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-sm",
                  communityMode === "community" ? "border-primary bg-accent" : "border-input",
                )}
              >
                In a community
              </button>
            </div>

            {communityMode === "community" && (
              <div className="flex flex-col gap-1.5 pt-1">
                {!isAdmin && !user ? (
                  <p className="text-xs text-muted-foreground">Sign in to attach this issue to a community.</p>
                ) : selectableCommunities.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    You haven&apos;t created any communities yet — create one below.
                  </p>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex h-9 items-center justify-between rounded-md border border-input px-3 text-sm text-foreground hover:bg-accent"
                      >
                        {selectedCommunity?.name ?? "Choose a community"}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
                      {selectableCommunities.map((c) => (
                        <DropdownMenuItem key={c.id} onClick={() => setCommunityId(c.id)}>
                          {c.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                <CreateCommunityDialog
                  quickMode
                  onCreated={(c) => setCommunityId(c.id)}
                  trigger={
                    <Button type="button" variant="outline" size="sm" className="w-fit">
                      <Icon icon={IconPlus} size={16} />
                      Create new community
                    </Button>
                  }
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Issue visibility</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVisibility("public")}
            className={cn(
              "flex-1 rounded-md border px-3 py-2 text-sm",
              visibility === "public" ? "border-primary bg-accent" : "border-input",
            )}
          >
            Public
          </button>
          <button
            type="button"
            onClick={() => setVisibility("private")}
            className={cn(
              "flex-1 rounded-md border px-3 py-2 text-sm",
              visibility === "private" ? "border-primary bg-accent" : "border-input",
            )}
          >
            Private
          </button>
        </div>
      </div>

      {visibility === "public" && (
        <div className="flex flex-col gap-2">
          <ToggleRow label="Show on homepage" checked={showOnHomepage} onChange={setShowOnHomepage} />
          <ToggleRow label="Show in search" checked={showInSearch} onChange={setShowInSearch} />
          <ToggleRow
            label="Support requires login"
            checked={supportRequiresLogin}
            onChange={setSupportRequiresLogin}
          />
          <ToggleRow label="Voting requires login" checked={voteRequiresLogin} onChange={setVoteRequiresLogin} />
        </div>
      )}

      <ToggleRow
        label="Allow people to suggest solutions"
        checked={allowSuggestSolutions}
        onChange={setAllowSuggestSolutions}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="go-live">Goes live</Label>
          <Input id="go-live" type="date" value={goLiveDate} onChange={(e) => setGoLiveDate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="voting-close">Voting closes</Label>
          <Input
            id="voting-close"
            type="date"
            value={votingCloseDate}
            onChange={(e) => setVotingCloseDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hidden-date">Hidden after</Label>
          <Input id="hidden-date" type="date" value={hiddenDate} onChange={(e) => setHiddenDate(e.target.value)} />
        </div>
      </div>
    </div>
  );

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
        ) : showAuthGate ? (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">Sign in</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <AuthGate
                title="Sign in to create an issue"
                description="You'll need an account to post — this is a simulated sign-in for the prototype."
              />
            </div>
          </>
        ) : isEditing ? (
          <>
            <DialogHeader>
              <DialogTitle>Edit issue</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-1">
              <div className="flex flex-col gap-6">
                {basicInfoFields}
                <div className="h-px bg-border" />
                {settingsFields}
              </div>
            </div>
            <div className="flex items-center justify-end border-t border-border pt-3">
              <Button size="sm" onClick={publish}>
                Save changes
              </Button>
            </div>
          </>
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
              {step === 0 && basicInfoFields}
              {step === 1 && settingsFields}

              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    Optional — invite people to help run this issue as part of the action team.
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
                    <Badge variant="outline">{visibility === "private" ? "Private" : "Public"}</Badge>
                    {selectedCommunity && (
                      <Badge variant="secondary">{selectedCommunity.name}</Badge>
                    )}
                  </div>
                  <h3 className="font-heading text-xl leading-snug font-bold text-foreground">
                    {title || "Untitled issue"}
                  </h3>
                  <p className="text-sm text-muted-foreground">{description || "No description yet."}</p>
                  {location && (
                    <p className="text-xs text-muted-foreground">{location}</p>
                  )}
                  {visibility === "public" && (
                    <p className="text-xs text-muted-foreground">
                      {[
                        showOnHomepage && "shown on homepage",
                        showInSearch && "shown in search",
                        supportRequiresLogin && "support requires login",
                        voteRequiresLogin && "voting requires login",
                      ]
                        .filter(Boolean)
                        .join(" · ") || "no extra visibility settings"}
                    </p>
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
                  Publish
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex h-9 items-center gap-2 rounded-md border px-3 text-sm",
        checked ? "border-primary bg-accent" : "border-input",
      )}
    >
      <span
        className={cn(
          "flex size-4 items-center justify-center rounded border",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border",
        )}
      >
        {checked && <Icon icon={IconCheck} size={12} />}
      </span>
      {label}
    </button>
  );
}
