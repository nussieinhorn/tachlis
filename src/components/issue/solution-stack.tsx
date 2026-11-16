"use client";

import { useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

import type { Solution } from "@/lib/mock-data";
import { SolutionCard } from "@/components/issue/solution-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { pluralize } from "@/lib/utils";

/**
 * The solutions beyond the first two, hidden behind one small "See N more solutions" button.
 * Clicking it opens them all, one after another.
 */
export function SolutionStack({
  solutions,
  issueId,
  canEdit,
  isFirstChosen,
  startIndex,
  commentsEnabled,
  commentsRequireLogin,
}: {
  solutions: Solution[];
  issueId: string;
  canEdit: boolean;
  isFirstChosen: boolean;
  startIndex: number;
  commentsEnabled?: boolean;
  commentsRequireLogin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (solutions.length === 0) return null;

  if (open) {
    return (
      <div className="flex flex-col gap-3">
        {solutions.map((solution, i) => (
          <div key={solution.id} className="animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <SolutionCard
              solution={solution}
              issueId={issueId}
              index={startIndex + i}
              canEdit={canEdit}
              isFirstChosen={isFirstChosen}
              commentsEnabled={commentsEnabled}
              commentsRequireLogin={commentsRequireLogin}
            />
          </div>
        ))}
        <Button variant="ghost" size="sm" className="mx-auto w-fit" onClick={() => setOpen(false)}>
          <Icon icon={IconChevronUp} size={16} />
          Show fewer
        </Button>
      </div>
    );
  }

  const total = solutions.length;

  return (
    <div className="flex justify-center">
      <Button type="button" variant="outline" size="sm" className="rounded-full px-4" onClick={() => setOpen(true)}>
        See {total} more {pluralize(total, "solution")}
        <Icon icon={IconChevronDown} size={16} />
      </Button>
    </div>
  );
}
