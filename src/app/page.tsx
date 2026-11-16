import Link from "next/link";
import { IconArrowRight, IconBulb, IconSpeakerphone, IconUsersGroup } from "@tabler/icons-react";

import { SiteHeader } from "@/components/site-header";
import { CreateIssueDialog } from "@/components/issue/create-issue-dialog";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { RecentIssuesMarquee } from "@/components/recent-issues-marquee";
import { ActionPlanShowcase } from "@/components/action-plan-showcase";
import { Reveal } from "@/components/reveal";
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
          <h1 className="animate-fade-up max-w-4xl text-balance text-5xl font-black text-foreground sm:text-7xl">
            Post a problem. Solve it together.
          </h1>
          <p className="animate-fade-up max-w-xl text-lg font-medium text-muted-foreground [animation-delay:120ms]">
            Public issues, proposed solutions, and public action tracking for your community — raise a problem, rally
            support, and follow it through to a fix.
          </p>
          <div className="animate-fade-up mt-2 flex flex-wrap items-center justify-center gap-3 [animation-delay:240ms]">
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
              <button type="button" className="animate-fade-up text-sm text-muted-foreground [animation-delay:360ms] hover:text-foreground">
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
            <Reveal delay={120}>
              <RecentIssuesMarquee issues={recent} categories={categories} />
            </Reveal>
          </section>
        )}

        <section className="mx-auto w-full max-w-6xl px-6 pb-32">
          <Reveal>
            <ActionPlanShowcase />
          </Reveal>
        </section>

        <section className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-32">
          <Reveal className="flex flex-col gap-2 text-center">
            <h2 className="mx-auto max-w-3xl text-balance text-3xl font-black sm:text-4xl">
              Stop complaining in the group chat. Start fixing it.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Every neighborhood has problems everyone talks about and nobody owns. MOTIVE gives them an owner, a vote and a plan.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {WHY.map((item, i) => (
              <Reveal key={item.title} delay={i * 110} className="h-full">
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icon icon={item.icon} size={22} />
                </span>
                <h3 className="font-heading text-lg leading-snug font-extrabold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="flex justify-center">
            <CreateIssueDialog
              trigger={
                <Button size="lg" className="h-12 px-8 text-base">
                  Raise your first issue
                </Button>
              }
            />
          </Reveal>
        </section>
      </main>
    </>
  );
}
