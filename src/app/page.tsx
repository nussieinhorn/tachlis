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
      <main className="flex w-full flex-col">
        <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-6 pt-16 pb-16 text-center">
          <h1 className="max-w-4xl text-balance text-5xl font-black text-foreground sm:text-7xl">
            Post a problem. Solve it together.
          </h1>
          <p className="max-w-xl text-lg font-medium text-muted-foreground">
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

        {/* A separate band: the search is the main thing, the feed is what it finds. */}
        <section className="border-y border-border bg-[#f1f1ef] dark:bg-card">
          <div className="mx-auto w-full max-w-5xl px-6 py-14">
            <IssueBrowser issues={activeIssues} categories={categories} />
          </div>
        </section>
      </main>
    </>
  );
}
