import { SiteHeader } from "@/components/site-header";
import { IssueBrowser } from "@/components/issue-browser";
import { CreateIssueDialog } from "@/components/issue/create-issue-dialog";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { Button } from "@/components/ui/button";
import { getCategories, getIssues } from "@/lib/supabase/queries";

export default async function Home() {
  const [issues, categories] = await Promise.all([getIssues(), getCategories()]);
  const activeIssues = issues.filter((issue) => issue.status !== "resolved" && issue.showOnHomepage);

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
          <CreateIssueDialog
            trigger={
              <Button size="lg" className="mt-2 h-12 px-8 text-base">
                Create Issue
              </Button>
            }
          />
          <CreateCommunityDialog
            defaultPrivacy="private"
            trigger={
              <button type="button" className="text-sm text-muted-foreground hover:text-foreground">
                Want a private space for your issues?{" "}
                <span className="font-medium text-primary hover:underline">Create community.</span>
              </button>
            }
          />
        </section>

        <IssueBrowser issues={activeIssues} categories={categories} />
      </main>
    </>
  );
}
