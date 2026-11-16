import { SiteHeader } from "@/components/site-header";
import { IssueBrowser } from "@/components/issue-browser";
import { getCategories, getIssues } from "@/lib/supabase/queries";

export const metadata = { title: "Search & Discover · MOTIVE" };

export default async function DiscoverPage() {
  const [issues, categories] = await Promise.all([getIssues(), getCategories()]);
  const listed = issues.filter((issue) => issue.visibility === "public" && issue.showInSearch);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-14">
        <IssueBrowser issues={listed} categories={categories} />
      </main>
    </>
  );
}
