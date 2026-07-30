import { SiteHeader } from "@/components/site-header";
import { CommunitiesBrowser } from "@/components/communities-browser";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { Button } from "@/components/ui/button";

export default function CommunitiesDirectory() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-2xl font-bold text-foreground">Communities</h1>
            <p className="max-w-2xl text-muted-foreground">
              Browse communities organizing around shared issues, or start your own.
            </p>
          </div>
          <CreateCommunityDialog trigger={<Button>Create community</Button>} />
        </div>

        <CommunitiesBrowser />
      </main>
    </>
  );
}
