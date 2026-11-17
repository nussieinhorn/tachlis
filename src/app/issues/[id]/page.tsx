import { abbreviateName } from "@/lib/format";
import type { Metadata } from "next";
import { cache } from "react";
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
import { IssueSolutionsSection } from "@/components/issue/issue-solutions-section";
import { MobileSupportBar } from "@/components/issue/mobile-support-bar";
import { IssueCommunitySection } from "@/components/issue/issue-community-section";
import { PrivateIssueGate } from "@/components/issue/private-issue-gate";
import { getCategory } from "@/lib/mock-data";
import { getCommunityByInternalId, getIssue, getIssueEditAccess, getIssueStub } from "@/lib/supabase/queries";

// One lookup shared by the page and its metadata.
const loadIssue = cache((id: string) => getIssue(id));

const clip = (text: string, max = 155) => {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max - 1).trimEnd()}…`;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const issue = await loadIssue(id);
  if (!issue) {
    return { title: "Private issue", robots: { index: false, follow: false } };
  }
  const where = issue.location ? ` in ${issue.location}` : "";
  const description = clip(`${issue.description} Support this issue${where} and follow the solutions and action plan on Motive.`);
  const isPrivate = issue.visibility === "private";
  return {
    title: issue.title,
    description,
    alternates: { canonical: `/issues/${issue.displayCode}` },
    robots: isPrivate ? { index: false, follow: false } : undefined,
    openGraph: { type: "article", title: issue.title, description, url: `/issues/${issue.displayCode}` },
    twitter: { card: "summary", title: issue.title, description },
  };
}

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = await loadIssue(id);

  if (!issue) {
    const stub = await getIssueStub(id);
    if (!stub || stub.visibility !== "private") notFound();
    return (
      <>
        <SiteHeader />
        <PrivateIssueGate issueId={stub.id} />
      </>
    );
  }

  const [community, canEdit] = await Promise.all([
    issue.communityId ? getCommunityByInternalId(issue.communityId) : Promise.resolve(undefined),
    getIssueEditAccess(issue.id),
  ]);

  const category = getCategory(issue.categorySlug);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs displayCode={issue.displayCode} />
          <div className="flex items-center gap-2">
            <IssueAdminBar issue={issue} canEdit={canEdit} />
          </div>
        </div>

        {/* On phones the two columns are flattened into one list and re-ordered with `order-*`:
            title/description, then the support card, then solutions, plan, community, updates, links. */}
        <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[2fr_1fr] lg:items-start lg:gap-20">
          <div className="flex flex-col gap-6 max-lg:contents">
            <div className="flex flex-col gap-3 max-lg:order-[10]">
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

              <h1 className="type-title">
                {issue.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Icon icon={IconCalendar} size={16} />
                  Created {issue.createdAt}
                  {issue.createdBy && (
                    <>
                      <Icon icon={IconUserCircle} size={16} className="ml-1" />
                      By {abbreviateName(issue.createdBy)}
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

            <div id="support-sentinel" className="max-lg:order-[25]" />

            <div className="max-lg:order-[30] empty:hidden">
              <IssueSolutionsSection issue={issue} canEdit={canEdit} />
            </div>

            {issue.firstChosenPromptedAt && issue.actionPlan && (canEdit || issue.actionPlanVisible) && (
              <div className="max-lg:order-[40]">
              <ActionPlanPanel
                issueId={issue.id}
                actionPlanId={issue.actionPlan.id}
                plan={issue.actionPlan}
                canEdit={canEdit}
                actionPlanVisible={issue.actionPlanVisible}
              />
              </div>
            )}

            {community && (
              <div className="max-lg:order-[45]">
                <IssueCommunitySection community={community} />
              </div>
            )}
          </div>

          <IssueSidebar
            issueId={issue.id}
            issueTitle={issue.title}
            isPrivate={issue.visibility === "private"}
            ownerName={issue.createdBy || undefined}
            canEdit={canEdit}
            supporterCount={issue.supporterCount}
            shareCount={issue.shareCount}
            visitCount={issue.visitCount}
            viewCount={issue.viewCount}
            supporterBreakdown={issue.supporterBreakdown}
            updates={issue.updates}
            discussion={issue.discussion}
            links={issue.links}
            commentsEnabled={issue.commentsEnabled}
            commentsRequireLogin={issue.commentsRequireLogin}
          />
        </div>
      </main>

      <MobileSupportBar
        issueId={issue.id}
        issueTitle={issue.title}
        isPrivate={issue.visibility === "private"}
        canEdit={canEdit}
        ownerName={issue.createdBy || undefined}
        initialSupporterCount={issue.supporterCount}
      />
    </>
  );
}
