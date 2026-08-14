import { SiteHeader } from "@/components/site-header";
import { IssueCard } from "@/components/issue-card";
import { getIssues } from "@/lib/supabase/queries";

export default async function SolvedArchive() {
  const issues = await getIssues();
  const resolvedIssues = issues.filter((issue) => issue.status === "resolved");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Solved
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Issues the community saw through from discussion to a real fix —
            a public record and a knowledge base for what worked.
          </p>
        </header>

        {resolvedIssues.length === 0 ? (
          <p className="text-muted-foreground">Nothing resolved yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {resolvedIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
