import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export default function ConfirmErrorPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="font-heading text-xl font-semibold text-foreground">
          That confirmation link didn&apos;t work
        </h1>
        <p className="text-sm text-muted-foreground">
          It may have expired or already been used. Try signing up again, or sign in if you&apos;ve
          already confirmed your account.
        </p>
        <Link href="/" className="text-sm font-medium text-primary hover:underline">
          Back to homepage
        </Link>
      </main>
    </>
  );
}
