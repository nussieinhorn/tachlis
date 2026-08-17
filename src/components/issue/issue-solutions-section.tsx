"use client";

import { IconSettings } from "@tabler/icons-react";

import type { Issue } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SolutionCard } from "@/components/issue/solution-card";
import { OtherProposals } from "@/components/issue/other-proposals";
import { SuggestSolution } from "@/components/issue/suggest-solution";
import { ManageSolutionsDialog } from "@/components/issue/manage-solutions-dialog";

export function IssueSolutionsSection({ issue, canEdit }: { issue: Issue; canEdit: boolean }) {
  const solutions = issue.solutions;
  const isFirstChosen = !issue.firstChosenPromptedAt;

  const manageDialog = (
    <ManageSolutionsDialog
      issueId={issue.id}
      solutions={solutions}
      showArchivedToUsers={issue.showHiddenSolutionsAfterChosen ?? true}
      trigger={
        <Button variant="outline" size="icon" aria-label="Manage solutions">
          <Icon icon={IconSettings} size={16} />
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
    const showOther = canEdit || (issue.showHiddenSolutionsAfterChosen ?? true);

    return (
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Solution{chosen.length > 1 ? "s" : ""} chosen
          </h2>
          <div className="flex items-center gap-2">
            {canEdit && manageDialog}
            {canEdit && <SuggestSolution issueId={issue.id} canEdit={canEdit} />}
          </div>
        </div>
        {chosen.map((solution) => (
          <SolutionCard
            key={solution.id}
            solution={solution}
            issueId={issue.id}
            headline
            canEdit={canEdit}
            isFirstChosen={isFirstChosen}
            commentsEnabled={issue.commentsEnabled}
            commentsRequireLogin={issue.commentsRequireLogin}
          />
        ))}
        {showOther && (
          <OtherProposals
            solutions={other}
            issueId={issue.id}
            canEdit={canEdit}
            isFirstChosen={isFirstChosen}
            commentsEnabled={issue.commentsEnabled}
            commentsRequireLogin={issue.commentsRequireLogin}
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
          {canEdit && manageDialog}
          {visible.length >= 1 && <SuggestSolution issueId={issue.id} canEdit={canEdit} />}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No solutions proposed yet — be the first to suggest one.
          </p>
          <SuggestSolution issueId={issue.id} size="lg" canEdit={canEdit} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.slice(0, 5).map((solution, i) => (
            <SolutionCard
              key={solution.id}
              solution={solution}
              issueId={issue.id}
              index={i}
              canEdit={canEdit}
              isFirstChosen={isFirstChosen}
              commentsEnabled={issue.commentsEnabled}
              commentsRequireLogin={issue.commentsRequireLogin}
            />
          ))}
        </div>
      )}
      {visible.length > 5 && (
        <OtherProposals
          solutions={visible.slice(5)}
          issueId={issue.id}
          canEdit={canEdit}
          isFirstChosen={isFirstChosen}
          label="more solutions"
          commentsEnabled={issue.commentsEnabled}
          commentsRequireLogin={issue.commentsRequireLogin}
        />
      )}

      {visible.length > 1 && <SuggestSolution issueId={issue.id} size="lg" canEdit={canEdit} />}
    </section>
  );
}
