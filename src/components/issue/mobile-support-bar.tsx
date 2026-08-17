"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck } from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ShareAccessPanel } from "@/components/share-access-panel";

/** Fixed bottom bar, mobile only — appears once the user scrolls past `#support-sentinel` (placed right after the description, before the solutions section). */
export function MobileSupportBar({
  issueId,
  issueTitle,
  isPrivate,
  canEdit,
  ownerName,
  initialSupporterCount,
}: {
  issueId: string;
  issueTitle: string;
  isPrivate: boolean;
  canEdit: boolean;
  ownerName?: string;
  initialSupporterCount: number;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [supported, setSupported] = useState(false);
  const [supporterCount, setSupporterCount] = useState(initialSupporterCount);

  useEffect(() => {
    const sentinel = document.getElementById("support-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), {
      rootMargin: "0px 0px -80% 0px",
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("issue_supports")
      .select("id")
      .eq("issue_id", issueId)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setSupported(Boolean(data)));
  }, [user, issueId]);

  async function quickSupport() {
    if (supported) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("issue_supports")
      .insert({ issue_id: issueId, user_id: user?.id ?? null, level: "just-support" });
    if (error) return;
    setSupported(true);
    setSupporterCount((c) => c + 1);
    router.refresh();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <span className="flex-1 text-sm text-foreground">
          <span className="font-semibold">{supporterCount}</span> people are supporting this issue
        </span>
        <Button size="sm" variant={supported ? "secondary" : "default"} onClick={quickSupport} disabled={supported}>
          {supported && <Icon icon={IconCheck} size={14} />}
          {supported ? "Supporting" : "Support"}
        </Button>
        <ShareAccessPanel
          resourceType="issue"
          resourceId={issueId}
          resourceTitle={issueTitle}
          isPrivate={isPrivate}
          canEdit={canEdit}
          ownerName={ownerName}
          triggerClassName="w-auto px-3 h-9 text-sm"
        />
      </div>
    </div>
  );
}
