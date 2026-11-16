"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconArrowUp, IconCheck } from "@tabler/icons-react";

import type { IdeaPreview } from "@/lib/supabase/queries";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/** A solution people can vote on without leaving the homepage. */
export function HomeIdeaCard({ idea }: { idea: IdeaPreview }) {
  const { user } = useAuth();
  const router = useRouter();
  const [votes, setVotes] = useState(idea.votes);
  const [voted, setVoted] = useState(false);
  const [rowId, setRowId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    createClient()
      .from("solution_votes")
      .select("id")
      .eq("solution_id", idea.id)
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setVoted(true);
          setRowId(data.id);
        }
      });
  }, [user, idea.id]);

  async function toggleVote() {
    if (idea.voteRequiresLogin && !user) {
      router.push(`/issues/${idea.issueCode}`);
      return;
    }
    const supabase = createClient();
    if (voted) {
      const previous = rowId;
      setVoted(false);
      setVotes((v) => Math.max(0, v - 1));
      setRowId(null);
      if (previous) {
        const { error } = await supabase.from("solution_votes").delete().eq("id", previous);
        if (error) {
          setVoted(true);
          setVotes((v) => v + 1);
          setRowId(previous);
        }
      }
      return;
    }
    setVoted(true);
    setVotes((v) => v + 1);
    const { data, error } = await supabase
      .from("solution_votes")
      .insert({ solution_id: idea.id, user_id: user?.id ?? null })
      .select("id")
      .single();
    if (error) {
      setVoted(false);
      setVotes((v) => Math.max(0, v - 1));
      return;
    }
    setRowId(data?.id ?? null);
  }

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-lg">
      <Link href={`/issues/${idea.issueCode}`} className="group flex flex-col gap-1.5">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          For: {idea.issueTitle}
        </span>
        <h3 className="type-subsection group-hover:text-primary">
          {idea.title}
        </h3>
      </Link>
      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{idea.description}</p>
      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="text-xs text-muted-foreground">{idea.location}</span>
        <Button size="sm" variant={voted ? "secondary" : "default"} onClick={toggleVote} className="gap-1.5">
          <Icon key={String(voted)} icon={voted ? IconCheck : IconArrowUp} size={16} className="animate-pop" />
          <span key={votes} className="animate-tick tabular-nums">
            {votes}
          </span>
          {voted ? "Voted" : "Vote"}
        </Button>
      </div>
    </article>
  );
}
