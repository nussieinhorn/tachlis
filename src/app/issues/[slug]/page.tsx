import { notFound } from "next/navigation";
import { IconMapPin } from "@tabler/icons-react";

import { getIssue, getCategory, ISSUES } from "@/lib/mock-data";
import { SPLASH_TONE_CLASSES } from "@/lib/splash-tone";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { JoinPanel } from "@/components/issue/join-panel";
import { SolutionCard } from "@/components/issue/solution-card";
import { OtherProposals } from "@/components/issue/other-proposals";
import { ActionPlanPanel } from "@/components/issue/action-plan-panel";
import { Discussion } from "@/components/issue/discussion";
import { Card, CardContent } from "@/components/ui/card";

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

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
        <div
          className={`flex h-40 items-center justify-center rounded-xl ${SPLASH_TONE_CLASSES[issue.splashTone]}`}
        >
          <Icon icon={category.icon} size={56} className="text-white/90" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Icon icon={category.icon} size={14} />
              {category.label}
            </Badge>
            <StatusBadge status={issue.status} />
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Icon icon={IconMapPin} size={16} />
              {issue.location}
            </span>
          </div>

          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            {issue.title}
          </h1>
          <p className="text-foreground/80">{issue.description}</p>

          <JoinPanel initialSupporterCount={issue.supporterCount} />
        </div>

        {isDecided && chosenSolution ? (
          <section className="flex flex-col gap-4 rounded-xl border-2 border-primary bg-accent/40 p-4">
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
                {issue.solutions.map((solution) => (
                  <SolutionCard key={solution.id} solution={solution} />
                ))}
              </div>
            )}
          </section>
        )}

        {issue.updates.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="font-heading text-lg font-semibold text-foreground">Updates</h2>
            <Card>
              <CardContent className="flex flex-col gap-3 pt-6">
                {issue.updates.map((update) => (
                  <div key={update.date} className="flex gap-3 text-sm">
                    <span className="w-24 shrink-0 text-muted-foreground">{update.date}</span>
                    <span className="text-foreground/80">{update.body}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">Discussion</h2>
          <Discussion initialComments={issue.discussion} />
        </section>
      </main>
    </>
  );
}
