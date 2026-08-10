"use client";

import { useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

import type { Solution } from "@/lib/mock-data";
import { SolutionCard } from "@/components/issue/solution-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function OtherProposals({
  solutions,
  label = "archived proposals",
  onUpdate,
  onHide,
  onDelete,
}: {
  solutions: Solution[];
  label?: string;
  onUpdate: (id: string, patch: Partial<Solution>) => void;
  onHide: (id: string) => void;
  onDelete: (id: string) => void;
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
              onUpdate={(patch) => onUpdate(solution.id, patch)}
              onHide={() => onHide(solution.id)}
              onDelete={() => onDelete(solution.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
