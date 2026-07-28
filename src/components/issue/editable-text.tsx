"use client";

import { useState } from "react";
import { IconPencil, IconCheck } from "@tabler/icons-react";

import { useAdminMode } from "@/lib/admin-mode";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function EditableText({
  value,
  as: Tag = "p",
  className,
  textareaClassName,
}: {
  value: string;
  as?: "h1" | "p";
  className?: string;
  textareaClassName?: string;
}) {
  const { isAdmin } = useAdminMode();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  if (!isAdmin) {
    return <Tag className={className}>{text}</Tag>;
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={cn("min-h-16", textareaClassName)}
          autoFocus
        />
        <Button size="sm" className="w-fit" onClick={() => setEditing(false)}>
          <Icon icon={IconCheck} size={16} />
          Save
        </Button>
      </div>
    );
  }

  return (
    <div className="group/editable flex items-start gap-2 rounded-md outline-dashed outline-1 outline-offset-4 outline-primary/30">
      <Tag className={className}>{text}</Tag>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-1 shrink-0 rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover/editable:opacity-100"
        aria-label="Edit"
      >
        <Icon icon={IconPencil} size={16} />
      </button>
    </div>
  );
}
