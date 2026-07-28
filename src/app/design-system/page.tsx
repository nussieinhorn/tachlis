import {
  IconBuildingCommunity,
  IconLeaf,
  IconSchool,
  IconRoad,
  IconHeartHandshake,
  IconShieldCheck,
  IconPlus,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge, ISSUE_STATUSES } from "@/components/ui/status-badge";
import { CategoryTile } from "@/components/category-tile";
import { Icon } from "@/components/ui/icon";

const CATEGORIES = [
  { icon: IconBuildingCommunity, label: "Housing" },
  { icon: IconLeaf, label: "Environment" },
  { icon: IconSchool, label: "Education" },
  { icon: IconRoad, label: "Infrastructure" },
  { icon: IconHeartHandshake, label: "Social Care" },
  { icon: IconShieldCheck, label: "Safety" },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold">Tachlis</h1>
        <p className="text-muted-foreground">
          Design system check — buttons, lifecycle status badges, and category
          tiles built on Tabler icons + shadcn-style components.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Buttons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Icon icon={IconPlus} />
            Start your own
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Issue lifecycle</h2>
        <div className="flex flex-wrap gap-2">
          {ISSUE_STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Category picker</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((category, i) => (
            <CategoryTile
              key={category.label}
              icon={category.icon}
              label={category.label}
              selected={i === 0}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Sample issue card</h2>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Pothole epidemic on Elm Street</CardTitle>
              <StatusBadge status="gaining-traction" />
            </div>
            <CardDescription>
              42 supporters · Downtown / Elm Street
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80">
              Three cars damaged this month. Residents want the city to
              prioritize repaving before winter.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
