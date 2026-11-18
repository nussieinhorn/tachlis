import Link from "next/link";
import {
  IconArrowRight,
  IconBulb,
  IconMessageCircle,
  IconPlus,
  IconThumbUp,
  IconTrendingUp,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";

import type { ActivityItem, DashboardData } from "@/lib/supabase/queries";
import type { Issue, CategoryOption } from "@/lib/mock-data";
import { CommunityAvatar } from "@/components/community-avatar";
import { formatRelativeTime, abbreviateName } from "@/lib/format";
import { pluralize } from "@/lib/utils";
import { CreateIssueDialog } from "@/components/issue/create-issue-dialog";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { Reveal } from "@/components/reveal";
import { CountUp } from "@/components/count-up";
import { IssueCard } from "@/components/issue-card";
import { RecentIssuesMarquee } from "@/components/recent-issues-marquee";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { StatusBadge } from "@/components/ui/status-badge";
import { AreaChart, Sparkline } from "@/components/dashboard/charts";
import { getCategoryIcon } from "@/lib/category-icons";

const ACTIVITY_ICON = {
  support: IconUsers,
  solution: IconBulb,
  comment: IconMessageCircle,
  vote: IconThumbUp,
} as const;

function Stat({ label, value, hint, delay = 0 }: { label: string; value: number; hint?: string; delay?: number }) {
  return (
    <Reveal delay={delay} className="h-full">
    <div className="flex h-full flex-col gap-1 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <CountUp value={value} className="font-heading text-4xl font-black tabular-nums" />
      {hint && <span className="text-xs font-semibold text-status-resolved">{hint}</span>}
    </div>
    </Reveal>
  );
}

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <li>
      <Link href={`/issues/${item.issueCode}`} className="flex items-start gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/60">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Icon icon={ACTIVITY_ICON[item.kind]} size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{item.detail}</span>
          <span className="block truncate text-xs text-muted-foreground">{item.issueTitle}</span>
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(item.at)}</span>
      </Link>
    </li>
  );
}

export function DashboardView({
  name,
  data,
  categories,
  suggestedIssues,
}: {
  name: string;
  data: DashboardData;
  categories: CategoryOption[];
  suggestedIssues: Issue[];
}) {
  const categoryList = categories.map((c) => ({ slug: c.slug, label: c.label, icon: getCategoryIcon(c.iconSlug) }));
  const categoryLabel = (slug: string) => categories.find((c) => c.slug === slug)?.label ?? slug;
  const firstName = name.trim().split(/\s+/)[0] || "there";
  const hasIssues = data.issues.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex animate-fade-up flex-col gap-1">
          <h1 className="type-title">Welcome back, {firstName}</h1>
        </div>
      </header>

      {hasIssues ? (
        <>
          <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <Reveal delay={80}>
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="type-subsection">Support growth</h2>
                  <p className="text-sm text-muted-foreground">Total supporters across your issues, last 30 days.</p>
                </div>
                {data.totals.newThisWeek > 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-status-resolved/15 px-3 py-1 text-xs font-bold text-status-resolved">
                    <Icon icon={IconTrendingUp} size={14} />+{data.totals.newThisWeek} this week
                  </span>
                )}
              </div>
              <AreaChart values={data.totalSeries} className="h-52" />
            </div>
            </Reveal>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Stat label="Supporters" value={data.totals.supporters} delay={160} />
              <Stat label="Issues" value={data.issues.length} delay={240} />
              <Stat label="Solutions" value={data.totals.solutions} delay={320} />
              <Stat label="Votes" value={data.totals.votes} delay={400} />
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="type-subsection">My issues</h2>
              </div>
              {/* Phones: a swipeable row of cards. Desktop: a two-column grid. */}
              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 sm:scroll-px-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
              {data.issues.slice(0, 4).map((issue, i) => (
                <Reveal key={issue.id} delay={(i % 2) * 100} className="h-auto w-[84%] shrink-0 snap-start sm:w-[60%] lg:h-full lg:w-auto">
                <Link
                  href={`/issues/${issue.displayCode}`}
                  className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-lg sm:gap-5 sm:p-8"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={issue.status} />
                    <span className="text-sm text-muted-foreground">{categoryLabel(issue.categorySlug)}</span>
                    {issue.pendingSolutions > 0 && (
                      <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
                        {issue.pendingSolutions} to review
                      </span>
                    )}
                  </div>
                  <h3 className="type-card-title group-hover:text-primary">
                    {issue.title}
                  </h3>
                  <div className="flex flex-wrap items-end justify-between gap-6 border-t border-border pt-5">
                    <div className="flex gap-6 sm:gap-8">
                      <div className="flex flex-col">
                        <span className="font-heading text-3xl font-black tabular-nums">{issue.supporterCount}</span>
                        <span className="text-xs text-muted-foreground">supporters</span>
                        {issue.newSupportersThisWeek > 0 && (
                          <span className="text-xs font-semibold text-status-resolved">+{issue.newSupportersThisWeek} this week</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-heading text-3xl font-black tabular-nums">{issue.solutionCount}</span>
                        <span className="text-xs text-muted-foreground">{pluralize(issue.solutionCount, "solution")}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-heading text-3xl font-black tabular-nums">{issue.votes}</span>
                        <span className="text-xs text-muted-foreground">{pluralize(issue.votes, "vote")}</span>
                      </div>
                    </div>
                    <Sparkline values={issue.supportSeries} className="h-10 w-32 text-foreground" />
                  </div>
                </Link>
                </Reveal>
              ))}
              </div>
              <Reveal>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="outline">
                  <Link href="/my-issues">
                    Manage all my issues
                    <Icon icon={IconArrowRight} size={16} />
                  </Link>
                </Button>
                <CreateIssueDialog
                  trigger={
                    <Button>
                      <Icon icon={IconPlus} size={16} />
                      Create a new issue
                    </Button>
                  }
                />
              </div>
              </Reveal>
            </div>
          </section>
        </>
      ) : (
        <section className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-16 text-center">
          <h2 className="type-subsection">Raise your first issue</h2>
          <p className="max-w-md text-muted-foreground">Post a problem in your community and watch support grow here.</p>
          <CreateIssueDialog trigger={<Button size="lg">Create issue</Button>} />
        </section>
      )}

      <section className="flex flex-col gap-5">
        <h2 className="type-subsection">My communities</h2>
        {data.communities.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-10 text-center">
            <p className="text-sm text-muted-foreground">You don&apos;t manage any communities yet.</p>
          </div>
        ) : (
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 sm:scroll-px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {data.communities.slice(0, 4).map((c, i) => (
              <Reveal key={c.id} delay={i * 90} className="h-auto w-[72%] shrink-0 snap-start sm:w-[40%] lg:h-full lg:w-auto">
              <Link
                href={`/communities/${c.displayCode}`}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-lg"
              >
                <CommunityAvatar tone={c.tone} name={c.name} className="size-10" iconSize={18} />
                <span className="type-subsection line-clamp-2 transition-colors group-hover:text-primary">{c.name}</span>
                <span className="mt-auto flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon icon={IconUsersGroup} size={14} /> {c.memberCount}
                  </span>
                  <span>
                    {c.issueCount} {pluralize(c.issueCount, "issue")}
                  </span>
                </span>
              </Link>
              </Reveal>
            ))}
          </div>
        )}
        <Reveal>
        <div className="flex flex-wrap items-center gap-3">
          {data.communities.length > 0 && (
            <Button asChild variant="outline">
              <Link href="/my-communities">
                Manage all my communities
                <Icon icon={IconArrowRight} size={16} />
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/communities">
              Discover public communities
              <Icon icon={IconArrowRight} size={16} />
            </Link>
          </Button>
          <CreateCommunityDialog
            trigger={
              <Button>
                <Icon icon={IconPlus} size={16} />
                Create a new community
              </Button>
            }
          />
        </div>
        </Reveal>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="type-subsection">Discover public issues</h2>
          <Link href="/issues" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            All <Icon icon={IconArrowRight} size={14} />
          </Link>
        </div>
        <Reveal>
        {suggestedIssues.length >= 3 ? (
          <RecentIssuesMarquee issues={suggestedIssues.slice(0, 8)} categories={categories} />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {suggestedIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} categories={categoryList} />
            ))}
          </div>
        )}
        </Reveal>
      </section>
    </div>
  );
}
