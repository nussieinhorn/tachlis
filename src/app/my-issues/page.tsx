import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { AuthGate } from "@/components/auth-gate";
import { StatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/server";
import { getIssuesOwnedBy } from "@/lib/supabase/queries";

export default async function MyIssuesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const myIssues = user ? await getIssuesOwnedBy(user.id) : [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-bold text-foreground">My issues</h1>
          <p className="max-w-2xl text-muted-foreground">
            Issues you&apos;ve created. Open one to manage it from its detail page.
          </p>
        </header>

        {!user ? (
          <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 py-10">
            <AuthGate
              title="Sign in to see your issues"
              description="You'll need an account to create and manage issues."
            />
          </div>
        ) : myIssues.length === 0 ? (
          <p className="text-muted-foreground">You haven&apos;t created any issues yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {myIssues.map((issue) => (
              <li key={issue.id}>
                <Link
                  href={`/issues/${issue.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 hover:bg-accent"
                >
                  <span className="truncate text-sm font-medium text-foreground">{issue.title}</span>
                  <StatusBadge status={issue.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
