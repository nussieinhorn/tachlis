import { IconPhoto } from "@tabler/icons-react";

import { Icon } from "@/components/ui/icon";

const TILE_COUNT = 4;

export function ImageGallery({ imageCount }: { imageCount: number }) {
  if (imageCount === 0) return null;

  const tiles = Math.min(imageCount, TILE_COUNT);
  const overflow = imageCount - tiles;

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: tiles }).map((_, i) => (
        <div
          key={i}
          className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        >
          <Icon icon={IconPhoto} size={20} />
        </div>
      ))}
      {overflow > 0 && (
        <span className="text-sm font-medium text-muted-foreground">+{overflow}</span>
      )}
    </div>
  );
}
