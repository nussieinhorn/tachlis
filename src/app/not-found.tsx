import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-col items-center gap-5 px-4 py-24 text-center sm:px-6">
        <p className="type-eyebrow">Error 404</p>
        <h1 className="type-title">We can&apos;t find that page</h1>
        <p className="text-muted-foreground">
          The link may be old or mistyped, or the issue or community may have been removed.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/issues">Browse issues</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </main>
    </>
  );
}
