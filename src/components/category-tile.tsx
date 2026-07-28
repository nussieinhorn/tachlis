import type { IconComponent } from "@/components/ui/icon";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function CategoryTile({
  icon,
  label,
  selected = false,
  onClick,
  className,
}: {
  icon: IconComponent;
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      data-slot="category-tile"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        selected && "border-primary bg-accent text-accent-foreground ring-2 ring-primary/40",
        className,
      )}
    >
      <Icon icon={icon} variant="tile" className="text-primary" />
      <span>{label}</span>
    </button>
  );
}
