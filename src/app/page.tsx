import Link from "next/link";
import { IconArrowRight, IconBulb, IconChecklist, IconSpeakerphone, IconUsersGroup } from "@tabler/icons-react";

import { SiteHeader } from "@/components/site-header";
import { CreateIssueDialog } from "@/components/issue/create-issue-dialog";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { RecentIssuesMarquee } from "@/components/recent-issues-marquee";
import { ActionPlanShowcase } from "@/components/action-plan-showcase";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { getCategories, getIssues } from "@/lib/supabase/queries";

const WHY = [
  {
    icon: IconSpeakerphone,
    title: "Problems stop getting lost",
    body: "Group chats bury them in a day. Here every issue gets one page, one count of who cares and one place to follow what happens next.",
  },
  {
    icon: IconBulb,
    title: "Votes beat volume",
    body: "The loudest voice doesn't win. Neighbors propose solutions and vote, so the best idea rises to the top where everyone can see it.",
  },
  {
    icon: IconChecklist,
    title: "Watch it actually get fixed",
    body: "Once a solution is chosen, a public action plan shows each step, who is on it and what's done. No more wondering if anyone is doing anything.",
  },
  {
    icon: IconUsersGroup,
    title: "Your people, your pace",
    body: "Keep it public for the whole town or private for your own community. You decide who can see it and who can help.",
  },
];

export default async function Home() {
  const [issues, categories] = await Promise.all([getIssues(), getCategories()]);
  const recent = issues.filter((i) => i.visibility === "public" && i.showOnHomepage && i.status !== "resolved")
    .sort((a, b) => b.supporterCount - a.supporterCount)
    .slice(0, 12);

  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-col">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 pt-20 pb-24 text-center">
          <h1 className="max-w-4xl text-balance text-5xl font-black text-foreground sm:text-7xl">
            Post a problem. Solve it together.
          </h1>
          <p className="max-w-xl text-lg font-medium text-muted-foreground">
            Public issues, proposed solutions, and public action tracking for your community — raise a problem, rally
            support, and follow it through to a fix.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <CreateIssueDialog
              trigger={
                <Button size="lg" className="h-12 px-8 text-base">
                  Create Issue
                </Button>
              }
            />
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
              <Link href="/discover">Discover issues</Link>
            </Button>
          </div>
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

        {recent.length > 0 && (
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-32">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black sm:text-3xl">Top issues now</h2>
              <Button asChild variant="outline" className="shrink-0">
                <Link href="/discover">
                  Discover more
                  <Icon icon={IconArrowRight} size={16} />
                </Link>
              </Button>
            </div>
            <RecentIssuesMarquee issues={recent} categories={categories} />
          </section>
        )}

        <section className="mx-auto w-full max-w-6xl px-6 pb-32">
          <ActionPlanShowcase />
        </section>

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-32">
          <div className="flex flex-col gap-2 text-center">
            <h2 className="mx-auto max-w-3xl text-balance text-3xl font-black sm:text-4xl">
              Stop complaining in the group chat. Start fixing it.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Every neighborhood has problems everyone talks about and nobody owns. MOTIVE gives them an owner, a vote and a plan.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((item) => (
              <div key={item.title} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icon icon={item.icon} size={22} />
                </span>
                <h3 className="font-heading text-lg leading-snug font-extrabold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <CreateIssueDialog
              trigger={
                <Button size="lg" className="h-12 px-8 text-base">
                  Raise your first issue
                </Button>
              }
            />
          </div>
        </section>
      </main>
    </>
  );
}
