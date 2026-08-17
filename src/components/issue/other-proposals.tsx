"use client";

import { useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

import type { Solution } from "@/lib/mock-data";
import { SolutionCard } from "@/components/issue/solution-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function OtherProposals({
  solutions,
  issueId,
  canEdit,
  isFirstChosen,
  label = "archived proposals",
  commentsEnabled,
  commentsRequireLogin,
}: {
  solutions: Solution[];
  issueId: string;
  canEdit: boolean;
  isFirstChosen: boolean;
  label?: string;
  commentsEnabled?: boolean;
  commentsRequireLogin?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (solutions.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <Button variant="ghost" size="sm" className="w-fit" onClick={() => setOpen((o) => !o)}>
        <Icon icon={open ? IconChevronUp : IconChevronDown} size={16} />
        {open ? "Hide" : "See"} {label} ({solutions.length})
      </Button>
      {open && (
        <div className="flex flex-col gap-3">
          {solutions.map((solution) => (
            <SolutionCard
              key={solution.id}
              solution={solution}
              issueId={issueId}
              canEdit={canEdit}
              isFirstChosen={isFirstChosen}
              commentsEnabled={commentsEnabled}
              commentsRequireLogin={commentsRequireLogin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
