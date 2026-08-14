import { notFound } from "next/navigation";
import { IconMapPin, IconCalendar, IconUserCircle } from "@tabler/icons-react";

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
import { getCategory } from "@/lib/mock-data";
import { getCommunity, getIssue, getIssueEditAccess, getIssueStub } from "@/lib/supabase/queries";

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = await getIssue(id);

  if (!issue) {
    const stub = await getIssueStub(id);
    if (!stub || stub.visibility !== "private") notFound();
    return (
      <>
        <SiteHeader />
        <PrivateIssueGate issueId={stub.id} issueTitle={stub.title} />
      </>
    );
  }

  const [community, canEdit] = await Promise.all([
    issue.communityId ? getCommunity(issue.communityId) : Promise.resolve(undefined),
    getIssueEditAccess(issue.id),
  ]);

  const category = getCategory(issue.categorySlug);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs id={issue.id} />
          <div className="flex items-center gap-2">
            {issue.visibility === "private" && canEdit && <AccessRequestsWidget issueId={issue.id} />}
            <IssueAdminBar issue={issue} canEdit={canEdit} />
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
                  {issue.createdBy && (
                    <>
                      <Icon icon={IconUserCircle} size={16} className="ml-1" />
                      By {issue.createdBy}
                    </>
                  )}
                </span>
                <span className="flex items-center gap-2">
                  Status
                  <IssueAdminStatus issueId={issue.id} initialStatus={issue.status} canEdit={canEdit} />
                </span>
              </div>

              <IssueDescription
                description={issue.description}
                descriptionMore={issue.descriptionMore}
              />
            </div>

            <IssueSolutionsSection issue={issue} canEdit={canEdit} />

            {issue.firstChosenPromptedAt && (
              <>
                {issue.actionPlan && (
                  <ActionPlanPanel actionPlanId={issue.actionPlan.id} plan={issue.actionPlan} canEdit={canEdit} />
                )}
                <ActionTeamPanel issueId={issue.id} actionPlan={issue.actionPlan} canEdit={canEdit} />
              </>
            )}

            {community && <IssueCommunitySection community={community} />}
          </div>

          <IssueSidebar
            issueId={issue.id}
            canEdit={canEdit}
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
    </>
  );
}
