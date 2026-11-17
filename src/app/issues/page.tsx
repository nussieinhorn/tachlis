import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PageHeading } from "@/components/page-heading";
import { IssueBrowser } from "@/components/issue-browser";
import { getCategories, getIssues } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Public issues",
  description:
    "Browse public community issues by place or topic. Support the ones that matter, vote on solutions and follow each plan through to a fix.",
  alternates: { canonical: "/issues" },
};

export default async function DiscoverPage({ searchParams }: { searchParams: Promise<{ q?: string; topic?: string }> }) {
  const { q, topic } = await searchParams;
  const [issues, categories] = await Promise.all([getIssues(), getCategories()]);
  const listed = issues.filter((issue) => issue.visibility === "public" && issue.showInSearch);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 py-14">
        <PageHeading title="Public issues" subtitle="Problems people are raising in the open. Find one by place or topic, then support it and vote on solutions." />
        <IssueBrowser issues={listed} categories={categories} initialQuery={q} initialCategory={topic} />
      </main>
    </>
  );
}
