import { SiteHeader } from "@/components/site-header";
import { MyCommunitiesList } from "@/components/my-communities-list";

export default function MyCommunitiesPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-bold text-foreground">My Communities</h1>
          <p className="max-w-2xl text-muted-foreground">
            Communities you&apos;ve created. Open one to see its issues, or start a new one.
          </p>
        </header>

        <MyCommunitiesList />
      </main>
    </>
  );
}
