import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";
import { PageHeading } from "@/components/page-heading";
import { AuthGateRefresh } from "@/components/auth-gate-refresh";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getDashboardData, getIssues, pickSuggestedIssues } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Your dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  // getClaims verifies the session token locally, so deciding who's signed in costs no network round trip.
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  if (!userId) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
          <PageHeading title="Your dashboard" subtitle="Your issues, communities and what's happening with them." />
          <AuthGateRefresh title="Sign in to see your dashboard" description="You'll need an account to see your issues and communities." />
        </main>
      </>
    );
  }

  const [data, categories, allIssues, profile] = await Promise.all([
    getDashboardData(userId),
    getCategories(),
    getIssues(),
    supabase.from("profiles").select("name").eq("id", userId).maybeSingle(),
  ]);
  const suggestedIssues = pickSuggestedIssues(
    allIssues,
    data.issues.map((i) => i.id),
    4,
  );

  return (
    <>
      <SiteHeader />
      <main className="flex w-full flex-col">
        <DashboardView name={profile.data?.name ?? ""} data={data} categories={categories} suggestedIssues={suggestedIssues} />
      </main>
    </>
  );
}
