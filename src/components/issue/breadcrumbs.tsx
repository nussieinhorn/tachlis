import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";

import { Icon } from "@/components/ui/icon";

export function Breadcrumbs({ displayCode }: { displayCode: string }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground hover:underline">
        Issues
      </Link>
      <Icon icon={IconChevronRight} size={14} />
      <span>#{displayCode}</span>
    </nav>
  );
}
