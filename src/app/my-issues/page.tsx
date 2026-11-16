import { SiteHeader } from "@/components/site-header";
import { AuthGateRefresh } from "@/components/auth-gate-refresh";
import { MyIssuesTable } from "@/components/my-issues-table";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getIssuesOwnedBy } from "@/lib/supabase/queries";

export default async function MyIssuesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [myIssues, categories] = await Promise.all([user ? getIssuesOwnedBy(user.id) : Promise.resolve([]), getCategories()]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-bold text-foreground">My issues</h1>
          <p className="max-w-2xl text-muted-foreground">
            Issues you&apos;ve created. Sort, group and update several at once.
          </p>
        </header>

        {!user ? (
          <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 py-10">
            <AuthGateRefresh
              title="Sign in to see your issues"
              description="You'll need an account to create and manage issues."
            />
          </div>
        ) : myIssues.length === 0 ? (
          <p className="text-muted-foreground">You haven&apos;t created any issues yet.</p>
        ) : (
          <MyIssuesTable issues={myIssues} categories={categories} />
        )}
      </main>
    </>
  );
}
