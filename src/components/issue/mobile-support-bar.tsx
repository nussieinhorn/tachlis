"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck, IconHeart } from "@tabler/icons-react";

import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ShareAccessPanel } from "@/components/share-access-panel";

/** Sticky bar pinned under the header, mobile only. It slides in once the support card (right before the solutions) has scrolled out of view. */
export function MobileSupportBar({
  issueId,
  issueTitle,
  isPrivate,
  canEdit,
  ownerName,
  initialSupporterCount,
  supportRequiresLogin = false,
}: {
  issueId: string;
  issueTitle: string;
  isPrivate: boolean;
  canEdit: boolean;
  ownerName?: string;
  initialSupporterCount: number;
  supportRequiresLogin?: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [supported, setSupported] = useState(false);
  const [supporterCount, setSupporterCount] = useState(initialSupporterCount);

  useEffect(() => {
    const sentinel = document.getElementById("support-sentinel");
    if (!sentinel) return;
    // Show only after the sentinel has gone off the TOP of the screen (not while it's still below).
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: "-60px 0px 0px 0px" },
    );
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
    if (supportRequiresLogin && !user) {
      // This issue asks supporters to sign in — bring them to the support card, which has the sign-in prompt.
      document.getElementById("support-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    // Optimistic: respond instantly, undo if the save fails.
    setSupported(true);
    setSupporterCount((c) => c + 1);
    const supabase = createClient();
    const { error } = await supabase
      .from("issue_supports")
      .insert({ issue_id: issueId, user_id: user?.id ?? null, level: "just-support" });
    if (error) {
      setSupported(false);
      setSupporterCount((c) => Math.max(0, c - 1));
      return;
    }
    router.refresh();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-[59px] z-30 border-b border-border bg-background/95 px-4 py-2 shadow-sm backdrop-blur animate-in slide-in-from-top-2 fade-in-0 duration-200 md:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-2">
        <span className="flex min-w-0 flex-1 items-baseline gap-1.5 text-sm text-muted-foreground">
          <span key={supporterCount} className="font-heading inline-block animate-tick text-lg font-black tabular-nums text-foreground">
            {supporterCount}
          </span>
          <span className="truncate">{supporterCount === 1 ? "supporter" : "supporters"}</span>
        </span>
        <Button
          variant={supported ? "secondary" : "default"}
          size="icon"
          aria-label={supported ? "Supporting" : "Support this issue"}
          onClick={quickSupport}
          disabled={supported}
        >
          <Icon icon={supported ? IconCheck : IconHeart} size={18} className={supported ? "animate-pop" : undefined} />
        </Button>
        <ShareAccessPanel
          resourceType="issue"
          resourceId={issueId}
          resourceTitle={issueTitle}
          isPrivate={isPrivate}
          canEdit={canEdit}
          ownerName={ownerName}
          iconOnly
          triggerClassName="size-9 w-9 px-0"
        />
      </div>
    </div>
  );
}
