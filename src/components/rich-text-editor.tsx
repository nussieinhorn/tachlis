"use client";

import { useEffect, useRef } from "react";
import { IconBold, IconItalic, IconList, IconListNumbers } from "@tabler/icons-react";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

// Minimal contentEditable-based rich text editor — deliberately not a full
// library dependency (see plan notes on avoiding new npm installs).
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Set initial content once (uncontrolled after mount) — a controlled
  // contentEditable via dangerouslySetInnerHTML would reset the cursor
  // to the start on every keystroke.
  useEffect(() => {
    if (ref.current && !ref.current.innerHTML) {
      ref.current.innerHTML = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string) {
    document.execCommand(command);
    ref.current?.focus();
    if (ref.current) onChange(ref.current.innerHTML);
  }

  return (
    <div className={cn("flex flex-col rounded-lg border border-input", className)}>
      <div className="flex items-center gap-1 border-b border-input px-2 py-1.5">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("bold")} className="rounded p-1.5 hover:bg-accent" aria-label="Bold">
          <Icon icon={IconBold} size={16} />
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("italic")} className="rounded p-1.5 hover:bg-accent" aria-label="Italic">
          <Icon icon={IconItalic} size={16} />
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertUnorderedList")} className="rounded p-1.5 hover:bg-accent" aria-label="Bullet list">
          <Icon icon={IconList} size={16} />
        </button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => exec("insertOrderedList")} className="rounded p-1.5 hover:bg-accent" aria-label="Numbered list">
          <Icon icon={IconListNumbers} size={16} />
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        className="min-h-32 flex-1 px-3 py-2 text-sm text-foreground outline-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
