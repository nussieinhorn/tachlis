"use client";

import { useState } from "react";
import { IconListDetails } from "@tabler/icons-react";

import type { Issue, Solution } from "@/lib/mock-data";
import { useAdminMode } from "@/lib/admin-mode";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SolutionCard } from "@/components/issue/solution-card";
import { OtherProposals } from "@/components/issue/other-proposals";
import { SuggestSolution } from "@/components/issue/suggest-solution";
import { ManageSolutionsDialog } from "@/components/issue/manage-solutions-dialog";

export function IssueSolutionsSection({ issue }: { issue: Issue }) {
  const { isAdmin } = useAdminMode();
  const [solutions, setSolutions] = useState<Solution[]>(issue.solutions);
  const [showArchivedToUsers, setShowArchivedToUsers] = useState(
    issue.showHiddenSolutionsAfterChosen ?? true,
  );

  function addSolution(solution: Solution) {
    setSolutions((prev) => [solution, ...prev]);
  }

  function updateSolution(id: string, patch: Partial<Solution>) {
    setSolutions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  const manageDialog = (
    <ManageSolutionsDialog
      solutions={solutions}
      showArchivedToUsers={showArchivedToUsers}
      onToggleShowArchived={setShowArchivedToUsers}
      onHide={(id) => updateSolution(id, { hidden: true })}
      onUnhide={(id) => updateSolution(id, { hidden: false })}
      onDelete={(id) => updateSolution(id, { deleted: true })}
      onRestore={(id) => updateSolution(id, { deleted: false })}
      trigger={
        <Button variant="outline" size="sm">
          <Icon icon={IconListDetails} size={16} />
          Manage solutions
        </Button>
      }
    />
  );

  const chosenIds = issue.chosenSolutionIds ?? [];
  const isDecided = chosenIds.length > 0;
  const visible = solutions.filter((s) => !s.deleted);

  if (isDecided) {
    const chosen = visible.filter((s) => chosenIds.includes(s.id));
    const other = visible.filter((s) => !chosenIds.includes(s.id));
    const showOther = isAdmin || showArchivedToUsers;

    return (
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Solution{chosen.length > 1 ? "s" : ""} chosen
          </h2>
          {isAdmin && manageDialog}
        </div>
        {chosen.map((solution) => (
          <SolutionCard
            key={solution.id}
            solution={solution}
            headline
            onUpdate={(patch) => updateSolution(solution.id, patch)}
            onHide={() => updateSolution(solution.id, { hidden: !solution.hidden })}
            onDelete={() => updateSolution(solution.id, { deleted: true })}
          />
        ))}
        {showOther && (
          <OtherProposals
            solutions={other}
            onUpdate={updateSolution}
            onHide={(id) =>
              updateSolution(id, { hidden: !solutions.find((s) => s.id === id)?.hidden })
            }
            onDelete={(id) => updateSolution(id, { deleted: true })}
          />
        )}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Solutions {visible.length > 0 && `(${visible.length})`}
        </h2>
        <div className="flex items-center gap-2">
          {isAdmin && manageDialog}
          <SuggestSolution onAdminAdd={addSolution} />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No solutions proposed yet — be the first to suggest one.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.slice(0, 5).map((solution, i) => (
            <SolutionCard
              key={solution.id}
              solution={solution}
              index={i}
              onUpdate={(patch) => updateSolution(solution.id, patch)}
              onHide={() => updateSolution(solution.id, { hidden: !solution.hidden })}
              onDelete={() => updateSolution(solution.id, { deleted: true })}
            />
          ))}
        </div>
      )}
      {visible.length > 5 && (
        <OtherProposals
          solutions={visible.slice(5)}
          label="more solutions"
          onUpdate={updateSolution}
          onHide={(id) =>
            updateSolution(id, { hidden: !solutions.find((s) => s.id === id)?.hidden })
          }
          onDelete={(id) => updateSolution(id, { deleted: true })}
        />
      )}

      <SuggestSolution size="lg" onAdminAdd={addSolution} />
    </section>
  );
}
