import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { IssueBrowser } from "@/components/issue-browser";
import { Button } from "@/components/ui/button";
import { ISSUES } from "@/lib/mock-data";

export default function Home() {
  const activeIssues = ISSUES.filter((issue) => issue.status !== "resolved");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-14">
        <section className="flex flex-col items-center gap-5 py-6 text-center">
          <h1 className="font-heading max-w-2xl text-4xl font-bold text-foreground sm:text-5xl">
            From discussion to actually solved.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Public issues, proposed solutions, and public action tracking for
            your community — raise a problem, rally support, and follow it
            through to a fix.
          </p>
          <Button asChild size="lg" className="mt-2 h-12 px-8 text-base">
            <Link href="/issues/new">Create Issue</Link>
          </Button>
        </section>

        <IssueBrowser issues={activeIssues} />
      </main>
    </>
  );
}
