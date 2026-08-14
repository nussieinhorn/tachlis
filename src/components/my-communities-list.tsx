"use client";

import type { Community } from "@/lib/communities-data";
import { MyCommunityRow } from "@/components/my-community-row";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { Button } from "@/components/ui/button";

export function MyCommunitiesList({
  communities,
  issueCounts,
}: {
  communities: Community[];
  issueCounts: Record<string, number>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <CreateCommunityDialog trigger={<Button className="w-fit">Create a new community</Button>} />

      {communities.length === 0 ? (
        <p className="text-muted-foreground">You haven&apos;t created any communities yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {communities.map((community) => (
            <MyCommunityRow key={community.id} community={community} issueCount={issueCounts[community.id] ?? 0} />
          ))}
        </div>
      )}
    </div>
  );
}
