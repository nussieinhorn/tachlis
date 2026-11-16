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
      <h2 className="font-heading text-xs font-extrabold uppercase tracking-[0.18em] text-primary">{label}</h2>
      {children}
    </section>
  );
}

export default function ThemePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-6 py-14">
      <header className="flex flex-col gap-6">
        <MotiveLogo />
        <h1 className="max-w-4xl text-6xl font-black sm:text-8xl">The theme, in one page.</h1>
        <p className="max-w-xl text-lg font-medium text-muted-foreground">
          Headlines that hit like a front page. Square corners, ink-black rules, hard-edged buttons.
        </p>
      </header>

      <Section label="Headlines">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Front page · 128 supporters</p>
            <h1 className="max-w-4xl text-5xl font-black sm:text-7xl">City ignores the Elm Street potholes. Residents are done waiting.</h1>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="max-w-3xl text-4xl font-extrabold sm:text-5xl">Three solutions on the table, one vote left to cast</h2>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Body copy sits in Public Sans: plain, readable and neutral, so the headlines can be loud.
            </p>
          </div>
          <h3 className="max-w-2xl text-2xl font-extrabold">Repaving crews start Monday after the council vote</h3>
        </div>
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
