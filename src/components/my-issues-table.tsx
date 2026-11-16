"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowDown,
  IconArrowUp,
  IconChevronDown,
  IconChevronRight,
  IconColumns3,
  IconLayoutList,
  IconSearch,
  IconX,
} from "@tabler/icons-react";

import type { Issue, CategoryOption } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import { cn, pluralize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortKey = "title" | "category" | "status" | "supporters" | "location" | "visibility" | "created";
type GroupKey = "none" | "status" | "category" | "location" | "visibility";
type ColumnKey = "category" | "status" | "supporters" | "location" | "visibility" | "created";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  "gaining-traction": "Gaining Traction",
  "solutions-proposed": "Solutions Proposed",
  "solution-chosen": "Solution Chosen",
  "in-action": "In Action",
  resolved: "Resolved",
};
const STATUS_ORDER = Object.keys(STATUS_LABELS);

// "Chosen" and "In action" come from picking a solution (which has its own guided flow), so they are not offered in bulk.
const BULK_STATUSES = ["new", "gaining-traction", "solutions-proposed", "resolved"];

const COLUMN_LABELS: Record<ColumnKey, string> = {
  category: "Category",
  status: "Status",
  supporters: "Supporters",
  location: "Location",
  visibility: "Visibility",
  created: "Created",
};

const GROUP_LABELS: Record<GroupKey, string> = {
  none: "No grouping",
  status: "Status",
  category: "Category",
  location: "Location",
  visibility: "Visibility",
};

export function MyIssuesTable({ issues, categories }: { issues: Issue[]; categories: CategoryOption[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [groupBy, setGroupBy] = useState<GroupKey>("none");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hiddenColumns, setHiddenColumns] = useState<Set<ColumnKey>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryLabel = (slug: string) => categories.find((c) => c.slug === slug)?.label ?? slug;
  const show = (col: ColumnKey) => !hiddenColumns.has(col);

  const valueOf = (issue: Issue, key: SortKey): string | number => {
    switch (key) {
      case "title":
        return issue.title.toLowerCase();
      case "category":
        return categoryLabel(issue.categorySlug).toLowerCase();
      case "status":
        return STATUS_ORDER.indexOf(issue.status);
      case "supporters":
        return issue.supporterCount;
      case "location":
        return (issue.location ?? "").toLowerCase();
      case "visibility":
        return issue.visibility;
      case "created":
        return issue.createdAtIso ?? "";
    }
  };

  const groupLabelOf = (issue: Issue, key: GroupKey): string => {
    switch (key) {
      case "status":
        return STATUS_LABELS[issue.status] ?? issue.status;
      case "category":
        return categoryLabel(issue.categorySlug);
      case "location":
        return issue.location || "No location";
      case "visibility":
        return issue.visibility === "public" ? "Public" : "Private";
      default:
        return "";
    }
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? issues.filter((i) => i.title.toLowerCase().includes(q) || (i.location ?? "").toLowerCase().includes(q))
      : issues;
    return [...filtered].sort((a, b) => {
      const av = valueOf(a, sortKey);
      const bv = valueOf(b, sortKey);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issues, query, sortKey, sortDir, categories]);

  const groups = useMemo(() => {
    if (groupBy === "none") return [{ label: "", items: rows }];
    const map = new Map<string, Issue[]>();
    for (const issue of rows) {
      const label = groupLabelOf(issue, groupBy);
      map.set(label, [...(map.get(label) ?? []), issue]);
    }
    const entries = [...map.entries()];
    if (groupBy === "status") {
      entries.sort(
        (a, b) =>
          STATUS_ORDER.findIndex((s) => STATUS_LABELS[s] === a[0]) -
          STATUS_ORDER.findIndex((s) => STATUS_LABELS[s] === b[0]),
      );
    } else {
      entries.sort((a, b) => a[0].localeCompare(b[0]));
    }
    return entries.map(([label, items]) => ({ label, items }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, groupBy, categories]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "supporters" || key === "created" ? "desc" : "asc");
    }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleMany(ids: string[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      const all = ids.every((id) => next.has(id));
      for (const id of ids) {
        if (all) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }

  function toggleGroup(label: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  const visibleIds = rows.map((r) => r.id);
  const selectedIds = [...selected].filter((id) => issues.some((i) => i.id === id));
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id));

  async function runBulk(action: () => PromiseLike<{ error: { message: string } | null }>) {
    setBusy(true);
    setError(null);
    const { error: err } = await action();
    setBusy(false);
    if (err) {
      setError(err.message);
      return false;
    }
    router.refresh();
    return true;
  }

  const supabase = createClient();
  const setStatus = (status: string) =>
    runBulk(() => supabase.from("issues").update({ status }).in("id", selectedIds));
  const setVisibility = (visibility: "public" | "private") =>
    runBulk(() => supabase.from("issues").update({ visibility }).in("id", selectedIds));
  const setHomepage = (show_on_homepage: boolean) =>
    runBulk(() => supabase.from("issues").update({ show_on_homepage }).in("id", selectedIds));
  async function deleteSelected() {
    const ok = await runBulk(() => supabase.from("issues").delete().in("id", selectedIds));
    if (ok) setSelected(new Set());
  }

  const colCount = 2 + (["category", "status", "supporters", "location", "visibility", "created"] as ColumnKey[]).filter(show).length;

  function Header({ label, sortable, align }: { label: string; sortable: SortKey; align?: "right" }) {
    const active = sortKey === sortable;
    return (
      <th className={cn("px-3 py-2 text-xs font-semibold tracking-wide uppercase", align === "right" && "text-right")}>
        <button
          type="button"
          onClick={() => toggleSort(sortable)}
          className={cn(
            "inline-flex items-center gap-1 hover:text-foreground",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {label}
          {active && <Icon icon={sortDir === "asc" ? IconArrowUp : IconArrowDown} size={12} />}
        </button>
      </th>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Icon
            icon={IconSearch}
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="pl-9"
            placeholder="Filter by title or location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Icon icon={IconLayoutList} size={14} />
                Group: {GROUP_LABELS[groupBy]}
                <Icon icon={IconChevronDown} size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(GROUP_LABELS) as GroupKey[]).map((key) => (
                <DropdownMenuItem key={key} onClick={() => setGroupBy(key)}>
                  {GROUP_LABELS[key]}
                  {key === groupBy && <span className="ml-auto text-xs text-muted-foreground">Selected</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Icon icon={IconColumns3} size={14} />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(COLUMN_LABELS) as ColumnKey[]).map((col) => (
                <DropdownMenuCheckboxItem
                  key={col}
                  checked={show(col)}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={() =>
                    setHiddenColumns((prev) => {
                      const next = new Set(prev);
                      if (next.has(col)) next.delete(col);
                      else next.add(col);
                      return next;
                    })
                  }
                >
                  {COLUMN_LABELS[col]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-foreground bg-foreground px-3 py-2 text-background">
          <span className="text-sm font-semibold">{selectedIds.length} selected</span>
          <div className="ml-2 flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={busy} className="border-background/40 bg-transparent text-background hover:bg-background hover:text-foreground">
                  Change status
                  <Icon icon={IconChevronDown} size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {BULK_STATUSES.map((s) => (
                  <DropdownMenuItem key={s} onClick={() => setStatus(s)}>
                    {STATUS_LABELS[s]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={busy} className="border-background/40 bg-transparent text-background hover:bg-background hover:text-foreground">
                  Visibility
                  <Icon icon={IconChevronDown} size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Who can see these</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setVisibility("public")}>Make public</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setVisibility("private")}>Make private</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setHomepage(true)}>Show on homepage</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setHomepage(false)}>Hide from homepage</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm" disabled={busy} className="border-background/40 bg-transparent text-background hover:bg-destructive hover:text-destructive-foreground">
                  Delete
                </Button>
              }
              title={`Delete ${selectedIds.length} ${pluralize(selectedIds.length, "issue")}?`}
              description="This permanently removes the selected issues along with their solutions, comments and supporters. It can't be undone."
              confirmLabel="Delete permanently"
              onConfirm={deleteSelected}
            />
          </div>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto flex items-center gap-1 text-sm text-background/80 hover:text-background"
          >
            <Icon icon={IconX} size={14} />
            Clear
          </button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="overflow-x-auto rounded-md border border-border bg-card">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead className="border-b border-border bg-muted/50 text-left">
            <tr>
              <th className="w-10 px-3 py-2">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allVisibleSelected}
                  onChange={() => toggleMany(visibleIds)}
                  className="size-4 accent-primary"
                />
              </th>
              <Header label="Issue" sortable="title" />
              {show("category") && <Header label="Category" sortable="category" />}
              {show("status") && <Header label="Status" sortable="status" />}
              {show("supporters") && <Header label="Supporters" sortable="supporters" align="right" />}
              {show("location") && <Header label="Location" sortable="location" />}
              {show("visibility") && <Header label="Visibility" sortable="visibility" />}
              {show("created") && <Header label="Created" sortable="created" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={colCount} className="px-3 py-8 text-center text-muted-foreground">
                  No issues match that filter.
                </td>
              </tr>
            )}
            {groups.map((group) => {
              const isCollapsed = group.label !== "" && collapsed.has(group.label);
              const ids = group.items.map((i) => i.id);
              return (
                <Fragment key={group.label || "all"}>
                  {group.label !== "" && (
                    <tr className="border-y border-border bg-muted/60">
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          aria-label={`Select group ${group.label}`}
                          checked={ids.length > 0 && ids.every((id) => selected.has(id))}
                          onChange={() => toggleMany(ids)}
                          className="size-4 accent-primary"
                        />
                      </td>
                      <td colSpan={colCount - 1} className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.label)}
                          className="flex items-center gap-1.5 text-sm font-bold"
                        >
                          <Icon icon={isCollapsed ? IconChevronRight : IconChevronDown} size={14} />
                          {group.label}
                          <span className="font-medium text-muted-foreground">({group.items.length})</span>
                        </button>
                      </td>
                    </tr>
                  )}
                  {!isCollapsed &&
                    group.items.map((issue) => (
                      <tr
                        key={issue.id}
                        className={cn(
                          "border-b border-border last:border-b-0 hover:bg-accent/50",
                          selected.has(issue.id) && "bg-accent/60",
                        )}
                      >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            aria-label={`Select ${issue.title}`}
                            checked={selected.has(issue.id)}
                            onChange={() => toggleRow(issue.id)}
                            className="size-4 accent-primary"
                          />
                        </td>
                        <td className="max-w-sm px-3 py-2.5">
                          <Link
                            href={`/issues/${issue.displayCode}`}
                            className="line-clamp-2 font-semibold text-foreground hover:text-primary"
                          >
                            {issue.title}
                          </Link>
                        </td>
                        {show("category") && (
                          <td className="px-3 py-2.5 text-muted-foreground">{categoryLabel(issue.categorySlug)}</td>
                        )}
                        {show("status") && (
                          <td className="px-3 py-2.5">
                            <StatusBadge status={issue.status} />
                          </td>
                        )}
                        {show("supporters") && (
                          <td className="px-3 py-2.5 text-right tabular-nums">{issue.supporterCount}</td>
                        )}
                        {show("location") && (
                          <td className="px-3 py-2.5 text-muted-foreground">{issue.location || "—"}</td>
                        )}
                        {show("visibility") && (
                          <td className="px-3 py-2.5 text-muted-foreground capitalize">{issue.visibility}</td>
                        )}
                        {show("created") && (
                          <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{issue.createdAt}</td>
                        )}
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        {rows.length} {pluralize(rows.length, "issue")}
      </p>
    </div>
  );
}
