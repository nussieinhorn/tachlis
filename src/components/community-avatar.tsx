import { IconUsersGroup } from "@tabler/icons-react";

import { COMMUNITY_TONE_CLASSES, type CommunityTone } from "@/lib/communities-data";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** A community's mark: a coloured circle with an icon. (No uploaded images, by design.) */
export function CommunityAvatar({
  tone,
  name,
  className,
  iconSize = 22,
}: {
  tone: CommunityTone;
  name?: string;
  className?: string;
  iconSize?: number;
}) {
  return (
    <div
      aria-hidden="true"
      title={name}
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
