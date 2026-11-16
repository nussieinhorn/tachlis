import { IconPlus, IconArrowRight } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge, ISSUE_STATUSES } from "@/components/ui/status-badge";
import { MotiveLogo } from "@/components/motive-logo";
import { Icon } from "@/components/ui/icon";

const SWATCHES = [
  { name: "Ink", cls: "bg-foreground", hex: "#0e0e0e" },
  { name: "Paper", cls: "bg-background border border-border", hex: "#fbfaf6" },
  { name: "Coral (primary)", cls: "bg-primary", hex: "#f45d48" },
  { name: "Rule", cls: "bg-border", hex: "#cdc8bd" },
  { name: "Muted text", cls: "bg-muted-foreground", hex: "#5f5b54" },
  { name: "Wash", cls: "bg-muted", hex: "#f2ebe4" },
];

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-5 border-t-2 border-foreground pt-4">
      <h2 className="type-eyebrow text-primary">{label}</h2>
      {children}
    </section>
  );
}

export default function ThemePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-6 py-14">
      <header className="flex flex-col gap-6">
        <MotiveLogo />
        <h1 className="type-display max-w-4xl">The theme, in one page.</h1>
        <p className="max-w-xl text-lg font-medium text-muted-foreground">
          Headlines that hit like a front page. Square corners, ink-black rules, hard-edged buttons.
        </p>
      </header>

      <Section label="Type scale">
        <div className="flex flex-col divide-y divide-border">
          {[
            ["type-display", "Raise an issue, solve it together.", "Hero headline, once per page"],
            ["type-title", "My issues", "Page title (h1)"],
            ["type-feature", "Watch it get fixed, step by step.", "Large marketing section heading"],
            ["type-section", "Top issues now", "Section heading (h2)"],
            ["type-dialog", "Sign in to continue", "Dialog and popup titles"],
            ["type-subsection", "Repair the Elm Street crosswalk", "Card and sub-section heading (h3)"],
            ["type-card-title", "Rents are rising faster than young families can keep up", "Issue card title"],
            ["type-panel", "Solutions (3)", "Panel and sidebar heading"],
            ["type-label", "Visible to supporters", "Small bold label"],
            ["type-eyebrow", "Name & phone", "Overline above a block"],
          ].map(([cls, sample, use]) => (
            <div key={cls} className="grid items-baseline gap-2 py-4 md:grid-cols-[11rem_1fr]">
              <div className="flex flex-col">
                <code className="text-xs font-semibold text-primary">{cls}</code>
                <span className="text-xs text-muted-foreground">{use}</span>
              </div>
              <p className={`${cls} max-w-3xl`}>{sample}</p>
            </div>
          ))}
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Headings never set their own size or weight. Pick a tier above and add only layout classes (width, spacing,
          colour). Body text is Public Sans; every tier above uses Archivo.
        </p>
      </Section>

      <Section label="Buttons">
        <div className="flex flex-wrap items-center gap-4">
          <Button size="lg">
            <Icon icon={IconPlus} />
            Create issue
          </Button>
          <Button>
            Support this
            <Icon icon={IconArrowRight} />
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Delete</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </Section>

      <Section label="Inputs and status">
        <div className="flex max-w-md flex-col gap-3">
          <Input placeholder="Email" />
          <Input placeholder="Search issues..." />
        </div>
        <div className="flex flex-wrap gap-2">
          {ISSUE_STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </Section>

      <Section label="Card">
        <Card className="max-w-xl">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-2xl font-extrabold leading-tight">Pothole epidemic on Elm Street</CardTitle>
              <StatusBadge status="gaining-traction" />
            </div>
            <CardDescription>42 supporters · Downtown / Elm Street</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <p className="text-sm text-foreground/80">
              Three cars damaged this month. Residents want the city to prioritize repaving before winter.
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section label="Colour">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {SWATCHES.map((s) => (
            <div key={s.name} className="flex flex-col gap-2">
              <div className={`h-20 w-full ${s.cls}`} />
              <p className="text-sm font-bold">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.hex}</p>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
