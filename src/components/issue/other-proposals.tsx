"use client";

import { useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";

import type { Solution } from "@/lib/mock-data";
import { SolutionCard } from "@/components/issue/solution-card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function OtherProposals({ solutions }: { solutions: Solution[] }) {
  const [open, setOpen] = useState(false);

  if (solutions.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <Button variant="ghost" size="sm" className="w-fit" onClick={() => setOpen((o) => !o)}>
        <Icon icon={open ? IconChevronUp : IconChevronDown} size={16} />
        {open ? "Hide" : "See"} other proposals ({solutions.length})
      </Button>
      {open && (
        <div className="flex flex-col gap-3">
          {solutions.map((solution) => (
            <SolutionCard key={solution.id} solution={solution} />
          ))}
        </div>
      )}
    </div>
  );
}
