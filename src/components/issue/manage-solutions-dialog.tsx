"use client";

import { useState, type ReactNode } from "react";
import { IconEye, IconEyeOff, IconRotate, IconTrash } from "@tabler/icons-react";

import type { Solution } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SettingRow } from "@/components/issue/setting-row";

export function ManageSolutionsDialog({
  solutions,
  trigger,
  showArchivedToUsers,
  onToggleShowArchived,
  onHide,
  onUnhide,
  onDelete,
  onRestore,
}: {
  solutions: Solution[];
  trigger: ReactNode;
  showArchivedToUsers: boolean;
  onToggleShowArchived: (checked: boolean) => void;
  onHide: (id: string) => void;
  onUnhide: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage solutions</DialogTitle>
          <DialogDescription>Restore, hide, or delete any solution on this issue.</DialogDescription>
        </DialogHeader>

        <SettingRow
          label="Show archived solutions to users"
          description="After one is chosen, let non-admins still see the others."
          checked={showArchivedToUsers}
          onChange={onToggleShowArchived}
        />

        <div className="flex-1 overflow-y-auto">
          {solutions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No solutions yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {solutions.map((solution) => (
                <li key={solution.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium text-foreground">{solution.title}</span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {solution.status}
                      </Badge>
                      {solution.deleted && (
                        <Badge variant="destructive" className="text-[10px]">
                          Deleted
                        </Badge>
                      )}
                      {solution.hidden && !solution.deleted && (
                        <Badge variant="secondary" className="text-[10px]">
                          Hidden
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {solution.deleted ? (
                      <Button variant="outline" size="sm" onClick={() => onRestore(solution.id)}>
                        <Icon icon={IconRotate} size={14} />
                        Restore
                      </Button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => (solution.hidden ? onUnhide(solution.id) : onHide(solution.id))}
                          className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          aria-label={solution.hidden ? "Unhide" : "Hide"}
                        >
                          <Icon icon={solution.hidden ? IconEye : IconEyeOff} size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(solution.id)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete"
                        >
                          <Icon icon={IconTrash} size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
