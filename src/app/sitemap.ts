import type { MetadataRoute } from "next";

import { getCommunities, getIssues } from "@/lib/supabase/queries";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tachlis.vercel.app";

// Needs the database, so build it per request instead of at build time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [issues, communities] = await Promise.all([getIssues(), getCommunities()]);
  return [
    { url: SITE, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/issues`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/communities`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    ...issues
      .filter((i) => i.visibility === "public" && i.showInSearch)
      .map((i) => ({ url: `${SITE}/issues/${i.displayCode}`, lastModified: i.createdAtIso, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...communities
      .filter((c) => c.privacy === "public")
      .map((c) => ({ url: `${SITE}/communities/${c.displayCode}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
