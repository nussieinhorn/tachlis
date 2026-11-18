import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { IconLock, IconMapPin, IconUsers, IconUsersGroup } from "@tabler/icons-react";

import { CommunityAvatar } from "@/components/community-avatar";
import { pluralize } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { PrivateIssueGate } from "@/components/issue/private-issue-gate";
import { createClient } from "@/lib/supabase/server";
import { IssueCard } from "@/components/issue-card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { CommunityAboutLink } from "@/components/community-about-link";
import { CommunityAdminBar } from "@/components/community-admin-bar";
import { ShareAccessPanel } from "@/components/share-access-panel";
import { getCommunity, getCommunityEditAccess, getIssuesByCommunity } from "@/lib/supabase/queries";

const loadCommunity = cache((id: string) => getCommunity(id));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const community = await loadCommunity(id);
  if (!community) return { title: "Community", robots: { index: false, follow: false } };
  const base = community.description?.trim() || "A community organizing around shared local issues.";
  const where = community.location ? ` Based in ${community.location}.` : "";
  const description = `${base}${where} Follow its issues, solutions and action plans on Motive.`.replace(/\s+/g, " ").slice(0, 158);
  return {
    title: community.name,
    description,
    alternates: { canonical: `/communities/${community.displayCode}` },
    robots: community.privacy === "private" ? { index: false, follow: false } : undefined,
    openGraph: { type: "website", title: community.name, description, url: `/communities/${community.displayCode}` },
    twitter: { card: "summary", title: community.name, description },
  };
}

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const community = await loadCommunity(id);
  if (!community) {
    // Private communities answer with a request-access screen instead of a bare 404.
    const supabase = await createClient();
    const { data: stub } = await supabase.rpc("get_community_stub", { p_display_code: id });
    if (!stub?.[0] || stub[0].privacy !== "private") notFound();
    return (
      <>
        <SiteHeader />
        <PrivateIssueGate issueId={stub[0].id} kind="community" />
      </>
    );
  }

  const [issues, canEdit] = await Promise.all([getIssuesByCommunity(community.id), getCommunityEditAccess(community.id)]);

  const isPrivate = community.privacy === "private";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <CommunityAvatar tone={community.tone} name={community.name} className="size-16" iconSize={28} />
            <div className="flex min-w-0 max-w-xl flex-col gap-1.5">
              <h1 className="type-title flex items-center gap-2 text-balance">
                {isPrivate && <Icon icon={IconLock} size={20} className="text-muted-foreground" />}
                {community.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{isPrivate ? "Private" : "Public"}</Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Icon icon={IconMapPin} size={14} />
                  {community.location}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Icon icon={IconUsers} size={14} />
                  {community.memberCount} {pluralize(community.memberCount, "member")} ·{" "}
                  {issues.length} {pluralize(issues.length, "issue")}
                </span>
                <CommunityAboutLink name={community.name} description={community.description ?? ""} />
              </div>
              {isPrivate && (
                <p className="text-xs text-muted-foreground">
                  Owned by {community.ownerName ?? "the owner"} — only invited people can see this.
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShareAccessPanel
              resourceType="community"
              resourceId={community.id}
              resourceTitle={community.name}
              isPrivate={isPrivate}
              canEdit={canEdit}
              ownerName={community.ownerName}
            />
            <CommunityAdminBar community={community} canEdit={canEdit} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="type-panel">
            Issues {issues.length > 0 && `(${issues.length})`}
          </h2>
          {issues.length === 0 ? (
            <p className="text-sm text-muted-foreground">No issues in this community yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
