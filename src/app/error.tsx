"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-5 px-4 text-center sm:px-6">
      <p className="type-eyebrow">Something went wrong</p>
      <h1 className="type-title">That didn&apos;t work</h1>
      <p className="text-muted-foreground">
        We hit an unexpected problem. Try again — if it keeps happening, please let us know.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </main>
  );
}
