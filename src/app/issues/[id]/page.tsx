import { notFound } from "next/navigation";
import Link from "next/link";
import { IconMapPin, IconCalendar, IconUserCircle, IconUsersGroup } from "@tabler/icons-react";

import { getIssue, getCategory, ISSUES } from "@/lib/mock-data";
import { getCommunity } from "@/lib/communities-data";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Breadcrumbs } from "@/components/issue/breadcrumbs";
import { IssueAdminBar } from "@/components/issue/issue-admin-bar";
import { IssueAdminStatus } from "@/components/issue/issue-admin-status";
import { IssueDescription } from "@/components/issue/issue-description";
import { EditableText } from "@/components/issue/editable-text";
import { IssueSidebar } from "@/components/issue/issue-sidebar";
import { SolutionCard } from "@/components/issue/solution-card";
import { OtherProposals } from "@/components/issue/other-proposals";
import { ActionPlanPanel } from "@/components/issue/action-plan-panel";
import { ActionTeamPanel } from "@/components/issue/action-team-panel";
import { SolutionsList } from "@/components/issue/solutions-list";

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
  const chosenSolutions = issue.solutions.filter((s) =>
    issue.chosenSolutionIds?.includes(s.id),
  );
  const isDecided = chosenSolutions.length > 0;
  const otherSolutions = issue.solutions.filter(
    (s) => !issue.chosenSolutionIds?.includes(s.id),
  );

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs id={issue.id} />
          <IssueAdminBar issue={issue} />
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
                {community && (
                  <Link
                    href={`/communities/${community.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    <Icon icon={IconUsersGroup} size={14} />
                    {community.name}
                  </Link>
                )}
              </div>

              <EditableText
                as="h1"
                value={issue.title}
                className="font-heading text-3xl font-bold text-foreground sm:text-4xl"
              />

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

            {isDecided ? (
              <section className="flex flex-col gap-4">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Solution{chosenSolutions.length > 1 ? "s" : ""} chosen
                </h2>
                {chosenSolutions.map((solution) => (
                  <SolutionCard key={solution.id} solution={solution} headline />
                ))}
                <OtherProposals solutions={otherSolutions} />

                {issue.actionPlan && <ActionPlanPanel plan={issue.actionPlan} />}
              </section>
            ) : (
              <SolutionsList initialSolutions={issue.solutions} issueStatus={issue.status} />
            )}

            <ActionTeamPanel actionPlan={issue.actionPlan} />
          </div>

          <IssueSidebar
            supporterCount={issue.supporterCount}
            shareCount={issue.shareCount}
            visitCount={issue.visitCount}
            viewCount={issue.viewCount}
            updates={issue.updates}
            discussion={issue.discussion}
          />
        </div>
      </main>
    </>
  );
}
