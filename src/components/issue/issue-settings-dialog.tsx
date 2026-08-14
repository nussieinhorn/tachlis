"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconPlus } from "@tabler/icons-react";

import type { Issue } from "@/lib/mock-data";
import type { Community } from "@/lib/communities-data";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { SettingRow } from "@/components/issue/setting-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function IssueSettingsDialog({ issue, trigger }: { issue: Issue; trigger: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ownedCommunities, setOwnedCommunities] = useState<Community[]>([]);

  const [communityId, setCommunityId] = useState<string | undefined>(issue.communityId);
  const [visibility, setVisibility] = useState<"public" | "private">(issue.visibility);
  const [showOnHomepage, setShowOnHomepage] = useState(issue.showOnHomepage);
  const [showInSearch, setShowInSearch] = useState(issue.showInSearch);
  const [supportRequiresLogin, setSupportRequiresLogin] = useState(issue.supportRequiresLogin);
  const [voteRequiresLogin, setVoteRequiresLogin] = useState(issue.voteRequiresLogin);
  const [allowSuggestSolutions, setAllowSuggestSolutions] = useState(issue.allowSuggestSolutions);
  const [commentsEnabled, setCommentsEnabled] = useState(issue.commentsEnabled);
  const [goLiveDate, setGoLiveDate] = useState(issue.goLiveDate ?? "");
  const [votingCloseDate, setVotingCloseDate] = useState(issue.votingCloseDate ?? "");
  const [hiddenDate, setHiddenDate] = useState(issue.hiddenDate ?? "");

  useEffect(() => {
    if (!open || !user) return;
    const supabase = createClient();
    supabase
      .from("communities")
      .select("*")
      .eq("owner_id", user.id)
      .then(({ data }) => {
        setOwnedCommunities(
          (data ?? []).map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description ?? "",
            location: c.location ?? "",
            privacy: c.privacy as Community["privacy"],
            memberCount: 0,
            tone: c.tone as Community["tone"],
            ownerId: c.owner_id ?? undefined,
          })),
        );
      });
  }, [open, user]);

  const selectableCommunities = ownedCommunities;
  const selectedCommunity = communityId ? selectableCommunities.find((c) => c.id === communityId) : undefined;

  function reset(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSaved(false);
      setError(null);
      setCommunityId(issue.communityId);
      setVisibility(issue.visibility);
      setShowOnHomepage(issue.showOnHomepage);
      setShowInSearch(issue.showInSearch);
      setSupportRequiresLogin(issue.supportRequiresLogin);
      setVoteRequiresLogin(issue.voteRequiresLogin);
      setAllowSuggestSolutions(issue.allowSuggestSolutions);
      setCommentsEnabled(issue.commentsEnabled);
      setGoLiveDate(issue.goLiveDate ?? "");
      setVotingCloseDate(issue.votingCloseDate ?? "");
      setHiddenDate(issue.hiddenDate ?? "");
      router.refresh();
    }
  }

  async function save() {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("issues")
      .update({
        community_id: communityId ?? null,
        visibility,
        show_on_homepage: showOnHomepage,
        show_in_search: showInSearch,
        support_requires_login: supportRequiresLogin,
        vote_requires_login: voteRequiresLogin,
        allow_suggest_solutions: allowSuggestSolutions,
        comments_enabled: commentsEnabled,
        go_live_date: goLiveDate || null,
        voting_close_date: votingCloseDate || null,
        hidden_date: hiddenDate || null,
      })
      .eq("id", issue.id);
    setSubmitting(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSaved(true);
  }

  return (
    <Dialog open={open} onOpenChange={reset}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Issue settings</DialogTitle>
        </DialogHeader>

        {saved ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-status-resolved/15 text-status-resolved">
              <Icon icon={IconCheck} size={28} />
            </div>
            <p className="text-sm text-muted-foreground">Settings saved.</p>
            <Button onClick={() => reset(false)}>Done</Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-1">
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
                  <SettingRow
                    label="Voting requires login"
                    checked={voteRequiresLogin}
                    onChange={setVoteRequiresLogin}
                  />
                  <SettingRow
                    label="Allow suggested solutions"
                    checked={allowSuggestSolutions}
                    onChange={setAllowSuggestSolutions}
                  />
                  <SettingRow label="Allow comments" checked={commentsEnabled} onChange={setCommentsEnabled} />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="settings-go-live">Goes live</Label>
                    <Input
                      id="settings-go-live"
                      type="date"
                      value={goLiveDate}
                      onChange={(e) => setGoLiveDate(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="settings-voting-close">Voting closes</Label>
                    <Input
                      id="settings-voting-close"
                      type="date"
                      value={votingCloseDate}
                      onChange={(e) => setVotingCloseDate(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="settings-hidden-date">Hidden after</Label>
                    <Input
                      id="settings-hidden-date"
                      type="date"
                      value={hiddenDate}
                      onChange={(e) => setHiddenDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 border-t border-border pt-4">
                  <Label>Community</Label>
                  <p className="text-xs text-muted-foreground">Want this issue to live inside a community?</p>
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
                </div>
              </div>
            </div>

            {error && <p className="px-1 text-sm text-destructive">{error}</p>}
            <div className="flex items-center justify-end border-t border-border pt-3">
              <Button size="sm" onClick={save} disabled={submitting}>
                {submitting ? "Saving..." : "Save settings"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
