import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tachlis.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/my-issues", "/my-communities", "/profile", "/settings", "/auth/", "/invite/", "/dashboard"] }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
