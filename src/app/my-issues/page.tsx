import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { ISSUES } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/status-badge";

// Demo-only: a few mock issues labeled as "yours" since nothing is actually
// owned/persisted yet in this prototype.
const MY_ISSUE_IDS = ["3654", "3659", "3667"];

export default function MyIssuesPage() {
  const myIssues = ISSUES.filter((i) => MY_ISSUE_IDS.includes(i.id));

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

        {myIssues.length === 0 ? (
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
