import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

import { COMMUNITIES } from "@/lib/communities-data";
import { CommunityCard } from "@/components/community-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function CommunityRow() {
  const featured = pickRandom(COMMUNITIES, 4);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Communities</h2>
        <Button asChild variant="ghost" size="sm">
          <Link href="/communities">
            Explore more
            <Icon icon={IconArrowRight} size={16} />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </div>
    </section>
  );
}
