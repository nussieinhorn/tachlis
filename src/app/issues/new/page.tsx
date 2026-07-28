"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconX,
  IconArrowLeft,
  IconArrowRight,
  IconUpload,
  IconMapPin,
  IconUsers,
  IconPlus,
  IconCheck,
} from "@tabler/icons-react";

import { CATEGORIES } from "@/lib/mock-data";
import { SPLASH_TONE_CLASSES, type SplashTone } from "@/lib/splash-tone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { CategoryTile } from "@/components/category-tile";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const STEPS = ["Basics", "Splash image", "Description", "Review"];
const SPLASH_OPTIONS: SplashTone[] = ["coral", "amber", "blue", "violet", "green", "slate"];

export default function CreateIssueWizard() {
  const [step, setStep] = useState(0);
  const [published, setPublished] = useState(false);

  const [title, setTitle] = useState("");
  const [categorySlug, setCategorySlug] = useState<string>(CATEGORIES[0].slug);
  const [location, setLocation] = useState("");
  const [splashTone, setSplashTone] = useState<SplashTone>("coral");
  const [description, setDescription] = useState("");

  const category = CATEGORIES.find((c) => c.slug === categorySlug) ?? CATEGORIES[0];

  const canAdvance =
    (step === 0 && title.trim().length > 0) ||
    step === 1 ||
    (step === 2 && description.trim().length > 0) ||
    step === 3;

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (published) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-status-resolved/15 text-status-resolved">
          <Icon icon={IconCheck} size={28} />
        </div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Published!</h1>
        <p className="max-w-sm text-muted-foreground">
          This is a static prototype, so your issue isn't actually saved — but
          this is the confirmation screen you'd see once it's live.
        </p>
        <Button asChild>
          <Link href="/">Back to the feed</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/">
            <Icon icon={IconX} />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                      ? "bg-status-resolved text-white"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <Icon icon={IconCheck} size={14} /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-sm sm:inline",
                  i === step ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
        <div className="w-9" />
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-10">
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                What's the problem?
              </h1>
              <p className="text-muted-foreground">
                Give it a clear, specific title people will recognize.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Pothole epidemic on Elm Street"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {CATEGORIES.map((c) => (
                  <CategoryTile
                    key={c.slug}
                    icon={c.icon}
                    label={c.label}
                    selected={c.slug === categorySlug}
                    onClick={() => setCategorySlug(c.slug)}
                  />
                ))}
                <button
                  type="button"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <Icon icon={IconPlus} variant="tile" />
                  New category
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                placeholder="e.g. Downtown / Elm Street"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Pick a splash image
              </h1>
              <p className="text-muted-foreground">
                Choose a curated look for {category.label.toLowerCase()}, or upload your own.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {SPLASH_OPTIONS.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setSplashTone(tone)}
                  className={cn(
                    "flex h-20 items-center justify-center rounded-xl ring-offset-2 transition-shadow",
                    SPLASH_TONE_CLASSES[tone],
                    splashTone === tone && "ring-2 ring-primary",
                  )}
                >
                  {splashTone === tone && <Icon icon={IconCheck} className="text-white" />}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Icon icon={IconUpload} variant="tile" />
              <span className="text-sm">Upload your own image</span>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Describe it briefly
              </h1>
              <p className="text-muted-foreground">
                A few sentences is plenty — you can expand this later once it's live.
              </p>
            </div>
            <Textarea
              placeholder="What's happening, and why does it matter?"
              className="min-h-40"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Review &amp; publish
              </h1>
              <p className="text-muted-foreground">
                This is exactly how it'll appear on the home feed.
              </p>
            </div>

            <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card">
              <div
                className={`flex h-28 items-center justify-center ${SPLASH_TONE_CLASSES[splashTone]}`}
              >
                <Icon icon={category.icon} size={36} className="text-white/90" />
              </div>
              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="gap-1">
                    <Icon icon={category.icon} size={14} />
                    {category.label}
                  </Badge>
                  <StatusBadge status="new" />
                </div>
                <h3 className="font-heading font-semibold text-foreground">
                  {title || "Untitled issue"}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {description || "No description yet."}
                </p>
                <div className="mt-auto flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon icon={IconUsers} size={16} />1 supporter
                  </span>
                  {location && (
                    <span className="flex items-center gap-1">
                      <Icon icon={IconMapPin} size={16} />
                      {location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-6 py-4">
        <Button variant="ghost" onClick={back} disabled={step === 0}>
          <Icon icon={IconArrowLeft} />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next} disabled={!canAdvance}>
            Next
            <Icon icon={IconArrowRight} />
          </Button>
        ) : (
          <Button onClick={() => setPublished(true)}>Publish</Button>
        )}
      </div>
    </main>
  );
}
