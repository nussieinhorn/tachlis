"use client";

import { useState } from "react";

import type { IssueStatus } from "@/components/ui/status-badge";
import type { Solution } from "@/lib/mock-data";
import { SolutionCard } from "@/components/issue/solution-card";
import { OtherProposals } from "@/components/issue/other-proposals";
import { SuggestSolution } from "@/components/issue/suggest-solution";

export function SolutionsList({
  initialSolutions,
  issueStatus,
}: {
  initialSolutions: Solution[];
  issueStatus: IssueStatus;
}) {
  const [solutions, setSolutions] = useState(initialSolutions);

  function addSolution(solution: Solution) {
    setSolutions((prev) => [solution, ...prev]);
  }

  const leadingSolutionId =
    issueStatus === "solutions-proposed" && solutions.length > 1
      ? solutions.reduce((max, s) => (s.votes > max.votes ? s : max), solutions[0]).id
      : undefined;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Solutions {solutions.length > 0 && `(${solutions.length})`}
        </h2>
        <SuggestSolution onAdminAdd={addSolution} />
      </div>

      {solutions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No solutions proposed yet — be the first to suggest one.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {solutions.slice(0, 5).map((solution, i) => (
            <SolutionCard
              key={solution.id}
              solution={solution}
              index={i}
              leading={solution.id === leadingSolutionId}
            />
          ))}
        </div>
      )}
      {solutions.length > 5 && (
        <OtherProposals solutions={solutions.slice(5)} label="more solutions" />
      )}

      <SuggestSolution size="lg" onAdminAdd={addSolution} />
    </section>
  );
}
