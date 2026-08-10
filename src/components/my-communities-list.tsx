"use client";

import { getCommunitiesOwnedBy } from "@/lib/communities-data";
import { useFakeSession } from "@/lib/fake-session";
import { MyCommunityRow } from "@/components/my-community-row";
import { CreateCommunityDialog } from "@/components/create-community-dialog";
import { AuthGate } from "@/components/auth-gate";
import { Button } from "@/components/ui/button";

export function MyCommunitiesList() {
  const { user, createdCommunities } = useFakeSession();

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4 py-10">
        <AuthGate
          title="Sign in to see your communities"
          description="You'll need an account to create and manage communities."
        />
      </div>
    );
  }

  const owned = [
    ...getCommunitiesOwnedBy(user.email),
    ...createdCommunities.filter((c) => c.ownerId === user.email),
  ];

  return (
    <div className="flex flex-col gap-6">
      <CreateCommunityDialog trigger={<Button className="w-fit">Create a new community</Button>} />

      {owned.length === 0 ? (
        <p className="text-muted-foreground">You haven&apos;t created any communities yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {owned.map((community) => (
            <MyCommunityRow key={community.id} community={community} />
          ))}
        </div>
      )}
    </div>
  );
}
