"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  id,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      data-slot="switch"
      className={cn(
        "peer inline-flex h-5.5 w-10 shrink-0 items-center rounded-full border border-transparent shadow-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none block size-4.5 rounded-full bg-background shadow-sm ring-0 transition-transform",
          checked ? "translate-x-[19px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export { Switch };
