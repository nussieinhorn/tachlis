import { notFound } from "next/navigation";
import { IconMapPin, IconCalendar, IconUserCircle } from "@tabler/icons-react";

import { getIssue, getCategory, ISSUES } from "@/lib/mock-data";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Breadcrumbs } from "@/components/issue/breadcrumbs";
import { IssueAdminBar } from "@/components/issue/issue-admin-bar";
import { IssueAdminStatus } from "@/components/issue/issue-admin-status";
import { IssueDescription } from "@/components/issue/issue-description";
import { ImageGallery } from "@/components/issue/image-gallery";
import { EditableText } from "@/components/issue/editable-text";
import { IssueSidebar } from "@/components/issue/issue-sidebar";
import { SolutionCard } from "@/components/issue/solution-card";
import { OtherProposals } from "@/components/issue/other-proposals";
import { ActionPlanPanel } from "@/components/issue/action-plan-panel";
import { ActionTeamPanel } from "@/components/issue/action-team-panel";
import { SuggestSolution } from "@/components/issue/suggest-solution";

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
  const chosenSolutions = issue.solutions.filter((s) =>
    issue.chosenSolutionIds?.includes(s.id),
  );
  const isDecided = chosenSolutions.length > 0;
  const otherSolutions = issue.solutions.filter(
    (s) => !issue.chosenSolutionIds?.includes(s.id),
  );

  const leadingSolutionId =
    issue.status === "solutions-proposed" && issue.solutions.length > 1
      ? issue.solutions.reduce((max, s) => (s.votes > max.votes ? s : max), issue.solutions[0]).id
      : undefined;

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

              <ImageGallery imageCount={issue.imageCount} />
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
              <section className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    Solutions {issue.solutions.length > 0 && `(${issue.solutions.length})`}
                  </h2>
                  <SuggestSolution />
                </div>
                {issue.solutions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No solutions proposed yet — be the first to suggest one.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {issue.solutions.slice(0, 5).map((solution, i) => (
                      <SolutionCard
                        key={solution.id}
                        solution={solution}
                        index={i}
                        leading={solution.id === leadingSolutionId}
                      />
                    ))}
                  </div>
                )}
                {issue.solutions.length > 5 && (
                  <OtherProposals solutions={issue.solutions.slice(5)} label="more solutions" />
                )}
              </section>
            )}

            <ActionTeamPanel actionPlan={issue.actionPlan} />
          </div>

          <IssueSidebar
            supporterCount={issue.supporterCount}
            shareCount={issue.shareCount}
            updates={issue.updates}
            discussion={issue.discussion}
          />
        </div>
      </main>
    </>
  );
}
