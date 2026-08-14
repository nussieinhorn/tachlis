import { SiteHeader } from "@/components/site-header";
import { MyCommunitiesList } from "@/components/my-communities-list";
import { AuthGate } from "@/components/auth-gate";
import { createClient } from "@/lib/supabase/server";
import { getCommunitiesOwnedBy, getCommunityIssueCount } from "@/lib/supabase/queries";

export default async function MyCommunitiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const communities = user ? await getCommunitiesOwnedBy(user.id) : [];
  const issueCountEntries = await Promise.all(
    communities.map(async (c) => [c.id, await getCommunityIssueCount(c.id)] as const),
  );
  const issueCounts = Object.fromEntries(issueCountEntries);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-bold text-foreground">My Communities</h1>
          <p className="max-w-2xl text-muted-foreground">
            Communities you&apos;ve created. Open one to see its issues, or start a new one.
          </p>
        </header>

        {!user ? (
          <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 py-10">
            <AuthGate
              title="Sign in to see your communities"
              description="You'll need an account to create and manage communities."
            />
          </div>
        ) : (
          <MyCommunitiesList communities={communities} issueCounts={issueCounts} />
        )}
      </main>
    </>
  );
}
