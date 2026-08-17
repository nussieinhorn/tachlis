"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function ActionPlanVisibilityToggle({ issueId, visible }: { issueId: string; visible: boolean }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function toggle() {
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from("issues").update({ action_plan_visible: !visible }).eq("id", issueId);
    setSubmitting(false);
    router.refresh();
  }

  if (visible) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Icon icon={IconEye} size={16} />
          Visible to the public
        </span>
        <Button type="button" variant="ghost" size="sm" disabled={submitting} onClick={toggle}>
          Hide from public
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <Icon icon={IconEyeOff} size={16} />
        Hidden from the public — only you can see this
      </span>
      <Button type="button" size="sm" disabled={submitting} onClick={toggle}>
        Show to public
      </Button>
    </div>
  );
}
