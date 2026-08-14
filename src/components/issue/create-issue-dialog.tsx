"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  IconCheck,
  IconX,
  IconCopy,
  IconLink,
  IconPlus,
  IconChevronDown,
  IconBrandWhatsapp,
  IconBrandFacebook,
  IconBrandTiktok,
  IconBrandInstagram,
} from "@tabler/icons-react";

import { CATEGORIES, type Issue } from "@/lib/mock-data";
import { COMMUNITIES, getCommunity, getCommunitiesOwnedBy, type Community } from "@/lib/communities-data";
import { useAdminMode } from "@/lib/admin-mode";
import { useAuth } from "@/lib/auth";
import { useCreatedCommunities } from "@/lib/created-communities";
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
import { SettingRow } from "@/components/issue/setting-row";
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

const BIG_SHARE_TARGETS = [
  { label: "WhatsApp", icon: IconBrandWhatsapp, urlPrefix: "https://wa.me/?text=" },
  { label: "Facebook", icon: IconBrandFacebook, urlPrefix: "https://www.facebook.com/sharer/sharer.php?u=" },
  { label: "TikTok", icon: IconBrandTiktok, urlPrefix: "https://www.tiktok.com/upload?url=" },
  { label: "Instagram", icon: IconBrandInstagram, urlPrefix: "https://www.instagram.com/?url=" },
];

type TeamInvite = { id: string; name: string; phone: string; email: string; canEdit: boolean };

export function CreateIssueDialog({
  trigger,
  editIssue,
  duplicateFrom,
  lockedCommunityId,
}: {
  trigger: ReactNode;
  /** When provided, the dialog opens pre-filled in "edit" mode instead of blank "create" mode. */
  editIssue?: Issue;
  /** When provided, the wizard opens in normal create mode pre-filled from this issue (Publish creates a new one). */
  duplicateFrom?: Issue;
  /** When provided (e.g. launched from a community page), the community is pre-set and can't be changed. */
  lockedCommunityId?: string;
}) {
  const { isAdmin } = useAdminMode();
  const { isSignedIn, user } = useAuth();
  const { createdCommunities } = useCreatedCommunities();
  const router = useRouter();
  const isEditing = Boolean(editIssue);
  const source = editIssue ?? duplicateFrom;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [published, setPublished] = useState(false);
  const [copied, setCopied] = useState(false);

  const [title, setTitle] = useState(source?.title ?? "");
  const [description, setDescription] = useState(source?.description ?? "");
  const [categorySlug, setCategorySlug] = useState<string | undefined>(source?.categorySlug);
  const [location, setLocation] = useState(source?.location ?? "");

  const [communityId, setCommunityId] = useState<string | undefined>(
    lockedCommunityId ?? source?.communityId,
  );

  const [visibility, setVisibility] = useState<"public" | "private">(source?.visibility ?? "public");
  const [showOnHomepage, setShowOnHomepage] = useState(source?.showOnHomepage ?? true);
  const [showInSearch, setShowInSearch] = useState(source?.showInSearch ?? true);
  const [supportRequiresLogin, setSupportRequiresLogin] = useState(source?.supportRequiresLogin ?? false);
  const [voteRequiresLogin, setVoteRequiresLogin] = useState(source?.voteRequiresLogin ?? false);
  const [allowSuggestSolutions, setAllowSuggestSolutions] = useState(source?.allowSuggestSolutions ?? true);
  const [commentsEnabled, setCommentsEnabled] = useState(source?.commentsEnabled ?? true);
  const [goLiveDate, setGoLiveDate] = useState(source?.goLiveDate ?? "");
  const [votingCloseDate, setVotingCloseDate] = useState(source?.votingCloseDate ?? "");
  const [hiddenDate, setHiddenDate] = useState(source?.hiddenDate ?? "");

  const [team, setTeam] = useState<TeamInvite[]>([]);

  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  const fakeId = "3" + Math.floor(600 + Math.random() * 99);
  const publishedUrl = typeof window !== "undefined" ? window.location.origin : "https://tachlis.org";

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
      setTitle(source?.title ?? "");
      setDescription(source?.description ?? "");
      setCategorySlug(source?.categorySlug);
      setLocation(source?.location ?? "");
      setCommunityId(lockedCommunityId ?? source?.communityId);
      setVisibility(source?.visibility ?? "public");
      setShowOnHomepage(source?.showOnHomepage ?? true);
      setShowInSearch(source?.showInSearch ?? true);
      setSupportRequiresLogin(source?.supportRequiresLogin ?? false);
      setVoteRequiresLogin(source?.voteRequiresLogin ?? false);
      setAllowSuggestSolutions(source?.allowSuggestSolutions ?? true);
      setCommentsEnabled(source?.commentsEnabled ?? true);
      setGoLiveDate(source?.goLiveDate ?? "");
      setVotingCloseDate(source?.votingCloseDate ?? "");
      setHiddenDate(source?.hiddenDate ?? "");
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
    navigator.clipboard?.writeText(`${publishedUrl}/issues/${editIssue?.id ?? fakeId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function done() {
    if (isEditing) {
      reset(false);
    } else {
      setOpen(false);
      router.push("/issues/3659");
    }
  }

  const canAdvance =
    (step === 0 && title.trim().length > 0 && description.trim().length > 0 && Boolean(categorySlug)) ||
    step === 1 ||
    step === 2 ||
    step === 3;

  const basicInfoFields = (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Input
          id="title"
          placeholder="Give your issue a clear, specific title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="h-auto rounded-none border-x-0 border-t-0 border-b-2 border-input px-0 font-heading text-2xl font-semibold shadow-none placeholder:font-normal placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-0 md:text-3xl"
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
                {category && <Icon icon={category.icon} size={16} />}
                <span className={cn(!category && "text-muted-foreground")}>
                  {category?.label ?? "Select a category"}
                </span>
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
        <p className="text-left text-xs text-muted-foreground">
          {visibility === "public"
            ? "Anyone can find this issue on Tachlis and in search. You choose whether support or voting requires signing in below."
            : "Hidden from search and the homepage. Only people you approve can view or engage with it."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <SettingRow
          label="Show on homepage"
          checked={showOnHomepage}
          onChange={setShowOnHomepage}
          disabled={visibility === "private"}
        />
        <SettingRow
          label="Show in search"
          checked={showInSearch}
          onChange={setShowInSearch}
          disabled={visibility === "private"}
        />
        <SettingRow
          label="Support requires login"
          checked={supportRequiresLogin}
          onChange={setSupportRequiresLogin}
        />
        <SettingRow label="Voting requires login" checked={voteRequiresLogin} onChange={setVoteRequiresLogin} />
        <SettingRow
          label="Allow suggested solutions"
          checked={allowSuggestSolutions}
          onChange={setAllowSuggestSolutions}
        />
        <SettingRow label="Allow comments" checked={commentsEnabled} onChange={setCommentsEnabled} />
      </div>

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

      <div className="flex flex-col gap-1.5 border-t border-border pt-4">
        <Label>Community</Label>
        {lockedCommunityId ? (
          <div className="flex h-9 items-center rounded-md border border-border bg-muted px-3 text-sm text-muted-foreground">
            {getCommunity(lockedCommunityId)?.name}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground">Want this issue to live inside a community?</p>
            {!isAdmin && !user ? (
              <p className="text-xs text-muted-foreground">Sign in to attach this issue to a community.</p>
            ) : (
              <>
                {selectableCommunities.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex h-9 items-center justify-between rounded-md border border-input px-3 text-sm text-foreground hover:bg-accent"
                      >
                        {selectedCommunity?.name ?? "Standalone (no community)"}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
                      <DropdownMenuItem onClick={() => setCommunityId(undefined)}>
                        Standalone (no community)
                      </DropdownMenuItem>
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
                    <button type="button" className="w-fit text-sm font-medium text-primary hover:underline">
                      {selectableCommunities.length > 0 ? (
                        <span className="flex items-center gap-1">
                          <Icon icon={IconPlus} size={14} />
                          Create another community
                        </span>
                      ) : (
                        "Create a new community"
                      )}
                    </button>
                  }
                />
              </>
            )}
          </div>
        )}
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
          isEditing ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-status-resolved/15 text-status-resolved">
                <Icon icon={IconCheck} size={28} />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">Changes saved!</DialogTitle>
              </DialogHeader>
              <p className="max-w-sm text-sm text-muted-foreground">Your changes are live.</p>
              <Button onClick={done}>Done</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-status-resolved/15 text-status-resolved">
                <Icon icon={IconCheck} size={28} />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center font-heading text-2xl">You&apos;re live!</DialogTitle>
              </DialogHeader>
              <p className="max-w-sm text-sm text-muted-foreground">
                Your issue is published — time to rally support and get it solved.
              </p>
              <div className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2">
                <span className="flex-1 truncate text-left text-sm text-muted-foreground">
                  tachlis.org/issues/{editIssue?.id ?? fakeId}
                </span>
                <button type="button" onClick={copyLink} aria-label="Copy link">
                  <Icon icon={copied ? IconCheck : IconLink} size={16} />
                </button>
              </div>
              <div className="grid w-full grid-cols-4 gap-2">
                {BIG_SHARE_TARGETS.map((target) => (
                  <a
                    key={target.label}
                    href={`${target.urlPrefix}${encodeURIComponent(`${publishedUrl}/issues/${editIssue?.id ?? fakeId}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-border px-2 py-4 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-accent"
                  >
                    <Icon icon={target.icon} size={26} />
                    {target.label}
                  </a>
                ))}
              </div>
              <Button onClick={done}>Done</Button>
            </div>
          )
        ) : showAuthGate ? (
          <>
            <DialogHeader>
              <DialogTitle className="sr-only">Sign in</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <AuthGate
                title="Sign in to create an issue"
                description="You'll need an account to post."
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
                    {category && (
                      <Badge variant="outline" className="gap-1">
                        <Icon icon={category.icon} size={14} />
                        {category.label}
                      </Badge>
                    )}
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
