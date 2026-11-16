import { IconUsersGroup } from "@tabler/icons-react";

import { COMMUNITY_TONE_CLASSES, type CommunityTone } from "@/lib/communities-data";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** A community's logo: the uploaded image when there is one, otherwise a coloured circle with an icon. */
export function CommunityAvatar({
  logoUrl,
  tone,
  name,
  className,
  iconSize = 22,
}: {
  logoUrl?: string | null;
  tone: CommunityTone;
  name: string;
  className?: string;
  iconSize?: number;
}) {
  return logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={`${name} logo`}
      className={cn("size-12 shrink-0 rounded-full border border-border bg-card object-cover", className)}
    />
  ) : (
    <div
      aria-hidden="true"
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-full text-white",
        COMMUNITY_TONE_CLASSES[tone],
        className,
      )}
    >
      <Icon icon={IconUsersGroup} size={iconSize} />
    </div>
  );
}
