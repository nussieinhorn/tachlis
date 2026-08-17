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
      <div className="flex items-center justify-between gap-3 rounded-lg bg-status-resolved/12 px-4 py-2.5 text-sm text-status-resolved">
        <span className="flex items-center gap-1.5 font-medium">
          <Icon icon={IconEye} size={16} />
          Visible to supporters
        </span>
        <Button type="button" variant="ghost" size="sm" disabled={submitting} onClick={toggle} className="text-status-resolved hover:bg-status-resolved/15 hover:text-status-resolved">
          Hide from supporters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-status-traction/12 px-4 py-2.5 text-sm text-status-traction">
      <span className="flex items-center gap-1.5 font-medium">
        <Icon icon={IconEyeOff} size={16} />
        Hidden from supporters — only editors can see this
      </span>
      <Button type="button" size="sm" disabled={submitting} onClick={toggle} className="bg-status-traction text-white hover:bg-status-traction/90">
        Show to supporters
      </Button>
    </div>
  );
}
