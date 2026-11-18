"use client";

import { useEffect, useState } from "react";
import { IconCheck, IconUsersGroup } from "@tabler/icons-react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const STEPS: { title: string; waiting: "not-started" | "needs-financing"; chip: string }[] = [
  { title: "Get three repair quotes", waiting: "not-started", chip: "Quotes collected" },
  { title: "Present quotes at the township meeting", waiting: "not-started", chip: "Meeting held" },
  { title: "Approve the budget with neighbors", waiting: "needs-financing", chip: "Budget approved" },
  { title: "Crews start repairs", waiting: "not-started", chip: "Crews on site" },
];

const PILL = {
  done: { label: "Done", cls: "border-status-resolved/30 bg-status-resolved/15 text-status-resolved" },
  "in-progress": { label: "In progress", cls: "border-status-action/30 bg-status-action/15 text-status-action" },
  "needs-financing": { label: "Needs financing", cls: "border-status-traction/30 bg-status-traction/15 text-status-traction" },
  "not-started": { label: "Not started", cls: "border-border bg-transparent text-muted-foreground" },
} as const;

/**
 * A decorative, animated illustration of an action plan: a tilted, softly glowing card that checks itself off on a
 * loop, with little "news" chips floating in. It looks like a screen but is just a picture.
 */
export function ActionPlanShowcase() {
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(STEPS.length - 1);
      return;
    }
    const id = setInterval(() => setDone((d) => (d >= STEPS.length ? 0 : d + 1)), 1800);
    return () => clearInterval(id);
  }, []);

  const pct = Math.round((done / STEPS.length) * 100);
  const lastDone = done > 0 ? STEPS[done - 1] : null;

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col gap-4">
        <h2 className="type-feature text-balance">Watch it get fixed, step by step.</h2>
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

      {/* The illustration */}
      <div aria-hidden="true" className="pointer-events-none relative mx-auto w-full max-w-lg select-none overflow-x-clip py-6 sm:py-10">
        {/* soft colour glow behind the card */}
        <div className="absolute -top-2 -right-6 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-4 -left-8 size-48 rounded-full bg-status-action/8 blur-3xl" />

        <div className="animate-float relative [transform:perspective(1400px)_rotateY(-9deg)_rotateX(5deg)_rotateZ(1.5deg)]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-xl shadow-foreground/5 sm:p-7">
            {/* title row */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="type-eyebrow">Action plan</span>
                <h3 className="type-subsection">Repair the Elm Street crosswalk</h3>
              </div>
              <span className="mt-0.5 shrink-0 rounded-md border border-status-action/30 bg-status-action/10 px-2 py-0.5 text-[11px] font-bold tracking-wider text-status-action uppercase">
                {done === STEPS.length ? "Complete" : "In progress"}
              </span>
            </div>

            {/* progress */}
            <div className="mt-6 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {done} of {STEPS.length} steps done
                </span>
                <span className="font-black tabular-nums text-muted-foreground">{pct}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {/* steps */}
            <ul className="mt-6 flex flex-col gap-3">
              {STEPS.map((step, i) => {
                const isDone = i < done;
                const isCurrent = i === done;
                const status: keyof typeof PILL = isDone ? "done" : isCurrent ? "in-progress" : step.waiting;
                return (
                  <li
                    key={i}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-500",
                      isDone ? "border-transparent bg-muted/60" : isCurrent ? "border-primary/30 bg-accent/40 shadow-sm" : "border-border bg-card",
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
                    <span
                      className={cn(
                        "flex-1 text-sm font-semibold transition-colors duration-500",
                        isDone && "text-muted-foreground line-through",
                      )}
                    >
                      {step.title}
                    </span>
                    <span
                      key={status}
                      className={cn(
                        "animate-tick shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider whitespace-nowrap uppercase",
                        PILL[status].cls,
                      )}
                    >
                      {PILL[status].label}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* team row */}
            <div className="mt-6 flex items-center gap-2">
              <span className="flex -space-x-2">
                {["bg-primary/70", "bg-status-action/70", "bg-status-resolved/70"].map((c) => (
                  <span key={c} className={cn("size-7 rounded-full border-2 border-card", c)} />
                ))}
              </span>
              <span className="text-xs font-medium text-muted-foreground">Dina, Moshe, Rivka and 9 more</span>
            </div>
          </div>
        </div>

        {/* floating news chip: changes with each step */}
        {lastDone && (
          <div
            key={done}
            className="animate-fade-up absolute -bottom-1 -left-2 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-bold shadow-xl sm:-left-6"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-status-resolved text-white">
              <Icon icon={IconCheck} size={12} />
            </span>
            {lastDone.chip}
          </div>
        )}
        <div className="animate-float-slow absolute top-0 -right-1 flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-xs font-bold text-background shadow-xl sm:-right-4">
          <IconUsersGroup size={14} stroke={2} />
          +12 neighbors joined
        </div>
      </div>
    </div>
  );
}
