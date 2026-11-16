"use client";

import { useEffect, useState } from "react";
import { IconCheck } from "@tabler/icons-react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

// `waiting` is the status a step shows before it becomes the current one.
const STEPS: { title: string; waiting: "not-started" | "needs-financing" }[] = [
  { title: "Get three repair quotes", waiting: "not-started" },
  { title: "Present the quotes at the township meeting", waiting: "not-started" },
  { title: "Approve the budget with neighbors", waiting: "needs-financing" },
  { title: "Crews start repairs", waiting: "not-started" },
];

const STATUS_STYLES = {
  done: { label: "Done", cls: "border-status-resolved/30 bg-status-resolved/12 text-status-resolved" },
  "in-progress": { label: "In progress", cls: "border-status-action/30 bg-status-action/12 text-status-action" },
  "needs-financing": { label: "Needs financing", cls: "border-status-traction/30 bg-status-traction/12 text-status-traction" },
  "not-started": { label: "Not started", cls: "border-border bg-transparent text-muted-foreground" },
} as const;

/** An illustrative Action Plan that checks itself off on a loop — it shows what following a fix looks like. */
export function ActionPlanShowcase() {
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(STEPS.length - 1);
      return;
    }
    const id = setInterval(() => setDone((d) => (d >= STEPS.length ? 0 : d + 1)), 1700);
    return () => clearInterval(id);
  }, []);

  const pct = Math.round((done / STEPS.length) * 100);
  const finished = done === STEPS.length;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col gap-4">
        <h2 className="text-balance text-3xl font-black sm:text-4xl">Watch it get fixed, step by step.</h2>
        <p className="max-w-lg text-lg text-muted-foreground">
          Once neighbors pick a solution, it becomes a public action plan: every step, who&apos;s on it, and what&apos;s
          done. Nobody has to wonder whether anything is happening.
        </p>
        <ul className="flex flex-col gap-2 text-sm font-medium text-foreground">
          <li className="flex items-center gap-2">
            <Icon icon={IconCheck} size={16} className="text-primary" /> Every step has a clear status
          </li>
          <li className="flex items-center gap-2">
            <Icon icon={IconCheck} size={16} className="text-primary" /> A live progress bar everyone can follow
          </li>
          <li className="flex items-center gap-2">
            <Icon icon={IconCheck} size={16} className="text-primary" /> Volunteers can join the action team
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Example action plan</span>
            <h3 className="font-heading text-xl font-extrabold">Repair the Elm Street crosswalk</h3>
          </div>
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wider whitespace-nowrap uppercase transition-colors duration-500",
              finished ? "border-status-resolved/40 bg-status-resolved/15 text-status-resolved" : "border-status-action/30 bg-status-action/10 text-status-action",
            )}
          >
            {finished ? "Complete" : "In progress"}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">
              {done} of {STEPS.length} steps done
            </span>
            <span className="text-muted-foreground tabular-nums">{pct}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ul className="mt-5 flex flex-col gap-2.5">
          {STEPS.map((step, i) => {
            const isDone = i < done;
            const isCurrent = i === done;
            const status: keyof typeof STATUS_STYLES = isDone ? "done" : isCurrent ? "in-progress" : step.waiting;
            return (
              <li
                key={step.title}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-500",
                  isDone ? "border-border bg-muted/50" : isCurrent ? "border-primary/40 bg-accent shadow-sm" : "border-border bg-card",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-500",
                    isDone ? "border-primary bg-primary text-primary-foreground" : isCurrent ? "border-primary" : "border-border",
                  )}
                >
                  {isDone && <Icon key={`c${i}`} icon={IconCheck} size={14} className="animate-pop" />}
                </span>
                <span className={cn("flex-1 text-sm font-semibold transition-colors", isDone && "text-muted-foreground line-through")}>
                  {step.title}
                </span>
                <span
                  key={status}
                  className={cn(
                    "animate-tick rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wider whitespace-nowrap uppercase",
                    STATUS_STYLES[status].cls,
                  )}
                >
                  {STATUS_STYLES[status].label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
