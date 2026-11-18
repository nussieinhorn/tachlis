"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { IconCheck, IconUsersGroup, IconSpeakerphone } from "@tabler/icons-react";

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
 * A decorative, animated illustration of an action plan: one straight card that checks itself off on a loop.
 * A cursor glides to each step and clicks it, a strike-through line draws across finished steps, the progress bar
 * fills, and little notification chips float over the card. It looks like a screen but is just a picture.
 */
export function ActionPlanShowcase() {
  const [done, setDone] = useState(0);
  const [cursorRow, setCursorRow] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);

  // The loop: glide to the next step, click it, wait, repeat. When all are done, hold for a moment and start over.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(STEPS.length);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const cycle = (d: number) => {
      if (d >= STEPS.length) {
        timers.push(
          setTimeout(() => {
            setDone(0);
            setCursorRow(0);
            cycle(0);
          }, 2600),
        );
        return;
      }
      setCursorRow(d);
      timers.push(
        setTimeout(() => {
          setClicks((c) => c + 1);
          setDone(d + 1);
          timers.push(setTimeout(() => cycle(d + 1), 900));
        }, 1100),
      );
    };
    cycle(0);
    return () => timers.forEach(clearTimeout);
  }, []);

  // Keep the cursor over the checkbox of the row it is working on.
  useLayoutEffect(() => {
    const row = rowRefs.current[Math.min(cursorRow, STEPS.length - 1)];
    if (!row) return;
    setCursor({ x: row.offsetLeft + 28, y: row.offsetTop + row.offsetHeight / 2 });
  }, [cursorRow]);

  const pct = Math.round((done / STEPS.length) * 100);
  const lastDone = done > 0 ? STEPS[done - 1] : null;
  const allDone = done >= STEPS.length;

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
      <div aria-hidden="true" className="pointer-events-none relative mx-auto w-full max-w-md select-none py-8 sm:py-10">
        {/* soft colour glow behind the card */}
        <div className="absolute -top-2 right-0 size-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-4 left-0 size-48 rounded-full bg-status-action/8 blur-3xl" />

        <div className="relative rounded-3xl border border-border bg-card p-6 shadow-xl shadow-foreground/5 sm:p-7">
          {/* title row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="type-eyebrow">Action plan</span>
              <h3 className="type-subsection">Repair the Elm Street crosswalk</h3>
            </div>
            <span className="mt-0.5 shrink-0 rounded-md border border-status-action/30 bg-status-action/10 px-2 py-0.5 text-[11px] font-bold tracking-wider text-status-action uppercase">
              {allDone ? "Complete" : "In progress"}
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
          <ul className="relative mt-6 flex flex-col gap-3">
            {STEPS.map((step, i) => {
              const isDone = i < done;
              const isCurrent = i === done;
              const status: keyof typeof PILL = isDone ? "done" : isCurrent ? "in-progress" : step.waiting;
              return (
                <li
                  key={i}
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
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
                  {/* the strike-through line draws itself across the title */}
                  <span className="relative flex-1 text-sm font-semibold">
                    <span className={cn("transition-colors duration-500", isDone && "text-muted-foreground")}>{step.title}</span>
                    <span
                      className="absolute top-1/2 left-0 h-[1.5px] bg-muted-foreground/80 transition-[width] duration-500 ease-out"
                      style={{ width: isDone ? "100%" : "0%" }}
                    />
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

            {/* the click: a ripple on the checkbox, then the cursor glides to the next one */}
            {cursor && (
              <>
                <span
                  key={clicks}
                  className="absolute size-6 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border-2 border-primary"
                  style={{ left: cursor.x, top: cursor.y, opacity: clicks === 0 ? 0 : undefined }}
                />
                <svg
                  viewBox="0 0 24 24"
                  className="absolute z-10 size-6 drop-shadow-md transition-[left,top] duration-[900ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
                  style={{ left: cursor.x - 3, top: cursor.y - 2 }}
                >
                  <path d="M5 3l14 8.5-6.2 1.5 3.6 6.6-2.6 1.4-3.6-6.6L5 18.5z" fill="#0e0e0e" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </>
            )}
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

        {/* floating news chip: changes with each step */}
        {lastDone && (
          <div
            key={done}
            className="animate-fade-up absolute bottom-1 -left-2 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-bold shadow-xl sm:-left-6"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-status-resolved text-white">
              <Icon icon={IconCheck} size={12} />
            </span>
            {lastDone.chip}
          </div>
        )}
        <div className="animate-float-slow absolute top-2 -right-1 flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-xs font-bold text-background shadow-xl sm:-right-4">
          <IconUsersGroup size={14} stroke={2} />
          +12 neighbors joined
        </div>
        <div className="animate-float absolute -right-1 bottom-16 flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold shadow-xl sm:-right-6">
          <span className="flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <IconSpeakerphone size={14} stroke={2} />
          </span>
          New update posted
        </div>
      </div>
    </div>
  );
}
