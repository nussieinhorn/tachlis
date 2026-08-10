import { notFound } from "next/navigation";
import { IconMapPin, IconCalendar, IconUserCircle } from "@tabler/icons-react";

import { getIssue, getCategory, ISSUES } from "@/lib/mock-data";
import { getCommunity } from "@/lib/communities-data";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Breadcrumbs } from "@/components/issue/breadcrumbs";
import { IssueAdminBar } from "@/components/issue/issue-admin-bar";
import { IssueAdminStatus } from "@/components/issue/issue-admin-status";
import { IssueDescription } from "@/components/issue/issue-description";
import { IssueSidebar } from "@/components/issue/issue-sidebar";
import { ActionPlanPanel } from "@/components/issue/action-plan-panel";
import { ActionTeamPanel } from "@/components/issue/action-team-panel";
import { IssueSolutionsSection } from "@/components/issue/issue-solutions-section";
import { IssueCommunitySection } from "@/components/issue/issue-community-section";
import { PrivateIssueGate } from "@/components/issue/private-issue-gate";
import { AccessRequestsWidget } from "@/components/issue/access-requests-widget";

export function generateStaticParams() {
  return ISSUES.map((issue) => ({ id: issue.id }));
}

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = getIssue(id);
  if (!issue) notFound();

  const category = getCategory(issue.categorySlug);
  const community = issue.communityId ? getCommunity(issue.communityId) : undefined;

  return (
    <>
      <SiteHeader />
      <PrivateIssueGate issueId={issue.id} issueTitle={issue.title} isPrivate={issue.visibility === "private"}>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs id={issue.id} />
          <div className="flex items-center gap-2">
            {issue.visibility === "private" && <AccessRequestsWidget issueId={issue.id} />}
            <IssueAdminBar issue={issue} />
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Icon icon={category.icon} size={14} />
                  {category.label}
                </Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Icon icon={IconMapPin} size={16} />
                  {issue.location}
                </span>
              </div>

              <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
                {issue.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Icon icon={IconCalendar} size={16} />
                  Created {issue.createdAt}
                  <Icon icon={IconUserCircle} size={16} className="ml-1" />
                  By {issue.createdBy}
                </span>
                <span className="flex items-center gap-2">
                  Status
                  <IssueAdminStatus initialStatus={issue.status} />
                </span>
              </div>

              <IssueDescription
                description={issue.description}
                descriptionMore={issue.descriptionMore}
              />
            </div>

            <IssueSolutionsSection issue={issue} />

            {issue.actionPlan && <ActionPlanPanel plan={issue.actionPlan} />}

            <ActionTeamPanel actionPlan={issue.actionPlan} />

            {community && <IssueCommunitySection community={community} />}
          </div>

          <IssueSidebar
            supporterCount={issue.supporterCount}
            shareCount={issue.shareCount}
            visitCount={issue.visitCount}
            viewCount={issue.viewCount}
            supporterBreakdown={issue.supporterBreakdown}
            updates={issue.updates}
            discussion={issue.discussion}
            links={issue.links}
          />
        </div>
      </main>
      </PrivateIssueGate>
    </>
  );
}
