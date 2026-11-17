"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowRight, IconFileText, IconLoader2, IconSearch, IconTag, IconUsersGroup } from "@tabler/icons-react";

import { createClient } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type Result = { key: string; kind: "issue" | "community" | "topic" | "all"; title: string; sub: string; href: string };

const KIND_ICON = { issue: IconFileText, community: IconUsersGroup, topic: IconTag, all: IconArrowRight } as const;
const KIND_LABEL = { issue: "Issues", community: "Communities", topic: "Topics", all: "" } as const;

/** Strip characters that would break a PostgREST filter or act as wildcards. */
function clean(q: string): string {
  return q.replace(/[%*,()\\]/g, " ").trim();
}

/** A pop-up that searches the whole system: issues, communities and topics. Opens from the header icon or Ctrl/Cmd+K. */
export function SearchDialog({ trigger }: { trigger: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const seq = useRef(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const q = clean(query);
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const mine = ++seq.current;
    const t = setTimeout(async () => {
      const supabase = createClient();
      const pattern = `%${q}%`;
      const [issues, communities, topics] = await Promise.all([
        supabase
          .from("issues")
          .select("display_code, title, location")
          .or(`title.ilike.${pattern},description.ilike.${pattern},location.ilike.${pattern}`)
          .eq("visibility", "public")
          .limit(5),
        supabase
          .from("communities")
          .select("display_code, name, location")
          .or(`name.ilike.${pattern},description.ilike.${pattern},location.ilike.${pattern}`)
          .limit(4),
        supabase.from("categories").select("slug, label").ilike("label", pattern).limit(3),
      ]);
      if (mine !== seq.current) return;
      const next: Result[] = [
        ...(issues.data ?? []).map((i) => ({
          key: `i-${i.display_code}`,
          kind: "issue" as const,
          title: i.title,
          sub: i.location ?? "",
          href: `/issues/${i.display_code}`,
        })),
        ...(communities.data ?? []).map((c) => ({
          key: `c-${c.display_code}`,
          kind: "community" as const,
          title: c.name,
          sub: c.location ?? "",
          href: `/communities/${c.display_code}`,
        })),
        ...(topics.data ?? []).map((t) => ({
          key: `t-${t.slug}`,
          kind: "topic" as const,
          title: t.label,
          sub: "Browse this topic",
          href: `/issues?topic=${encodeURIComponent(t.slug)}`,
        })),
        { key: "all", kind: "all" as const, title: `See all issues matching "${q}"`, sub: "", href: `/issues?q=${encodeURIComponent(q)}` },
      ];
      setResults(next);
      setActive(0);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  function go(r: Result) {
    setOpen(false);
    setQuery("");
    router.push(r.href);
  }

  let lastKind: Result["kind"] | null = null;

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}
      >
        <DialogContent showCloseButton={false} className="gap-0 overflow-hidden px-0 pt-0 pb-0 sm:top-[18%] sm:max-w-xl sm:translate-y-0 sm:p-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="flex items-center gap-3 border-b border-border px-4">
            <Icon icon={loading ? IconLoader2 : IconSearch} size={20} className={cn("text-muted-foreground", loading && "animate-spin")} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" && results.length) {
                  e.preventDefault();
                  setActive((i) => (i + 1) % results.length);
                } else if (e.key === "ArrowUp" && results.length) {
                  e.preventDefault();
                  setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
                } else if (e.key === "Enter" && results[active]) {
                  e.preventDefault();
                  go(results[active]);
                }
              }}
              placeholder="Search issues, communities, topics..."
              className="h-14 w-full bg-transparent text-base font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded-md border border-border px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground sm:block">Esc</kbd>
          </div>
          <div className="max-h-[22rem] overflow-y-auto p-2">
            {clean(query).length < 2 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">Type to search everything on Motive.</p>
            ) : results.length === 0 && !loading ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">Nothing found yet.</p>
            ) : (
              results.map((r, i) => {
                const header = r.kind !== lastKind && r.kind !== "all";
                lastKind = r.kind;
                return (
                  <div key={r.key}>
                    {header && (
                      <p className="px-3 pt-2 pb-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                        {KIND_LABEL[r.kind]}
                      </p>
                    )}
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(r)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                        i === active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
                        r.kind === "all" && "mt-1 border-t border-border font-semibold",
                      )}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Icon icon={KIND_ICON[r.kind]} size={16} />
                      </span>
                      <span className="line-clamp-1 font-semibold">{r.title}</span>
                      {r.sub && <span className="ml-auto shrink-0 text-xs text-muted-foreground">{r.sub}</span>}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
