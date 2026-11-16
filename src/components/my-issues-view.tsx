"use client";

import { useState } from "react";
import { IconCircleCheck } from "@tabler/icons-react";

import type { Issue, CategoryOption } from "@/lib/mock-data";
import { MyIssuesTable } from "@/components/my-issues-table";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/** My issues, split into Active and Solved so finished work has its own place. */
export function MyIssuesView({ issues, categories }: { issues: Issue[]; categories: CategoryOption[] }) {
  const active = issues.filter((i) => i.status !== "resolved");
  const solved = issues.filter((i) => i.status === "resolved");
  const [tab, setTab] = useState<"active" | "solved">("active");

  const tabs = [
    { key: "active" as const, label: "Active", count: active.length },
    { key: "solved" as const, label: "Solved", count: solved.length },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="inline-flex w-fit gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              tab === t.key ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.key === "solved" && <Icon icon={IconCircleCheck} size={15} />}
            {t.label}
            <span className={cn("text-xs tabular-nums", tab === t.key ? "text-background/70" : "text-muted-foreground")}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {tab === "active" ? (
        active.length === 0 ? (
          <p className="text-muted-foreground">No active issues. Everything you raised has been solved.</p>
        ) : (
          <MyIssuesTable issues={active} categories={categories} />
        )
      ) : solved.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center">
          <p className="font-heading text-lg font-extrabold">Nothing solved yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            When an issue you raised is marked resolved, it moves here as part of your public record.
          </p>
        </div>
      ) : (
        <MyIssuesTable issues={solved} categories={categories} />
      )}
    </div>
  );
}
