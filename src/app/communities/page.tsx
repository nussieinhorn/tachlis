import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PageHeading } from "@/components/page-heading";
import { CommunitiesBrowser } from "@/components/communities-browser";
import { getCommunities, getCommunityIssueCounts, getEditableCommunityIds } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Public communities",
  description:
    "Find open communities organizing around shared local issues, or start your own. Join one to follow its issues, solutions and action plans.",
  alternates: { canonical: "/communities" },
};

export default async function CommunitiesDirectory() {
  // Only public communities are listed here; the ones you own or manage live on your dashboard.
  const communities = (await getCommunities()).filter((c) => c.privacy === "public");
  const [editableIds, issueCounts] = await Promise.all([
    getEditableCommunityIds(),
    getCommunityIssueCounts(communities.map((c) => c.id)),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 py-14">
        <PageHeading title="Public communities" subtitle="Open communities organizing around shared issues. Join one, or start your own." />
        <CommunitiesBrowser communities={communities} issueCounts={issueCounts} editableIds={[...editableIds]} />
      </main>
    </>
  );
}
