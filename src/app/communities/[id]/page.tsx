import { notFound } from "next/navigation";
import { IconMapPin, IconUsers, IconUsersGroup } from "@tabler/icons-react";

import { COMMUNITIES, getCommunity, getCommunityIssueCount } from "@/lib/communities-data";
import { COMMUNITY_TONE_CLASSES } from "@/lib/communities-data";
import { ISSUES } from "@/lib/mock-data";
import { pluralize } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { IssueCard } from "@/components/issue-card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { CommunityJoinPanel } from "@/components/community-join-panel";
import { CommunityAdminBar } from "@/components/community-admin-bar";

export function generateStaticParams() {
  return COMMUNITIES.map((c) => ({ id: c.id }));
}

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const community = getCommunity(id);
  if (!community) notFound();

  const issueCount = getCommunityIssueCount(community.id);
  const issues = ISSUES.filter((issue) => issue.communityId === community.id);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`flex size-16 shrink-0 items-center justify-center rounded-full text-white ${COMMUNITY_TONE_CLASSES[community.tone]}`}
            >
              <Icon icon={IconUsersGroup} size={28} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="font-heading text-2xl font-bold text-foreground">{community.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{community.privacy === "private" ? "Private" : "Public"}</Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Icon icon={IconMapPin} size={14} />
                  {community.location}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Icon icon={IconUsers} size={14} />
                  {community.memberCount} {pluralize(community.memberCount, "member")} ·{" "}
                  {issueCount} {pluralize(issueCount, "issue")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CommunityJoinPanel communityId={community.id} communityName={community.name} />
            <CommunityAdminBar community={community} />
          </div>
        </div>

        <p className="max-w-2xl text-muted-foreground">{community.description}</p>

        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">
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
