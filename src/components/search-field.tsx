"use client";

import type { ReactNode } from "react";
import { IconSearch, IconX } from "@tabler/icons-react";

import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

/** The big search box used at the top of the Issues and Communities pages. */
export function SearchField({
  value,
  onChange,
  placeholder,
  trailing,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <Icon icon={IconSearch} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-foreground" />
      <Input
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        className="h-14 rounded-2xl border-2 border-foreground bg-background pr-36 pl-12 text-lg font-semibold shadow-md placeholder:font-medium focus-visible:border-primary focus-visible:ring-primary/30"
      />
      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange("")}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon icon={IconX} size={16} />
          </button>
        )}
        {trailing}
      </div>
    </div>
  );
}
