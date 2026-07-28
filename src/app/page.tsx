import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

import { SiteHeader } from "@/components/site-header";
import { IssueCard } from "@/components/issue-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ISSUES } from "@/lib/mock-data";

export default function Home() {
  const activeIssues = ISSUES.filter((issue) => issue.status !== "resolved");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <section className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card px-6 py-8">
          <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
            From discussion to actually solved.
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Public issues, proposed solutions, and public action tracking for
            your community — raise a problem, rally support, and follow it
            through to a fix.
          </p>
          <Button asChild>
            <Link href="/issues/new">Start your own</Link>
          </Button>
        </section>

        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Active issues
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/solved">
              See what's been solved
              <Icon icon={IconArrowRight} size={16} />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </main>
    </>
  );
}
