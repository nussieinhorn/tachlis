import { notFound } from "next/navigation";
import { IconMapPin } from "@tabler/icons-react";

import { getIssue, getCategory, ISSUES } from "@/lib/mock-data";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Breadcrumbs } from "@/components/issue/breadcrumbs";
import { IssueDescription } from "@/components/issue/issue-description";
import { EditableText } from "@/components/issue/editable-text";
import { IssueSidebar } from "@/components/issue/issue-sidebar";
import { SolutionCard } from "@/components/issue/solution-card";
import { OtherProposals } from "@/components/issue/other-proposals";
import { ActionPlanPanel } from "@/components/issue/action-plan-panel";

export function generateStaticParams() {
  return ISSUES.map((issue) => ({ slug: issue.slug }));
}

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = getIssue(slug);
  if (!issue) notFound();

  const category = getCategory(issue.categorySlug);
  const isDecided = Boolean(issue.chosenSolutionId);
  const chosenSolution = issue.solutions.find((s) => s.id === issue.chosenSolutionId);
  const otherSolutions = issue.solutions.filter((s) => s.id !== issue.chosenSolutionId);

  const leadingSolutionId =
    issue.status === "solutions-proposed" && issue.solutions.length > 1
      ? issue.solutions.reduce((max, s) => (s.votes > max.votes ? s : max), issue.solutions[0]).id
      : undefined;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <Breadcrumbs location={issue.location} category={category.label} />

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

              <StatusBadge status={issue.status} size="lg" />

              <EditableText
                as="h1"
                value={issue.title}
                className="font-heading text-3xl font-bold text-foreground sm:text-4xl"
              />

              <IssueDescription
                description={issue.description}
                descriptionMore={issue.descriptionMore}
              />
            </div>

            {isDecided && chosenSolution ? (
              <section className="flex flex-col gap-4">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Solution chosen
                </h2>
                <SolutionCard solution={chosenSolution} headline />
                <OtherProposals solutions={otherSolutions} />

                {issue.actionPlan && <ActionPlanPanel plan={issue.actionPlan} />}
              </section>
            ) : (
              <section className="flex flex-col gap-3">
                <h2 className="font-heading text-lg font-semibold text-foreground">
                  Solutions {issue.solutions.length > 0 && `(${issue.solutions.length})`}
                </h2>
                {issue.solutions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No solutions proposed yet — be the first to suggest one.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {issue.solutions.map((solution, i) => (
                      <SolutionCard
                        key={solution.id}
                        solution={solution}
                        index={i}
                        leading={solution.id === leadingSolutionId}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>

          <IssueSidebar
            supporterCount={issue.supporterCount}
            updates={issue.updates}
            discussion={issue.discussion}
          />
        </div>
      </main>
    </>
  );
}
