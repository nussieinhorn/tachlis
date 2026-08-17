import {
  IconHeartHandshake,
  IconSchool,
  IconBook2,
  IconBooks,
  IconBuildingBank,
  IconGift,
  IconBuildingCommunity,
  IconShieldCheck,
  IconCertificate,
  IconRoute,
  IconHeartbeat,
  IconShoppingBag,
  IconDroplet,
  IconConfetti,
  IconBus,
  IconBriefcase,
  IconBrain,
  IconWheelchair,
  IconTent,
  IconArmchair,
  IconBuildingChurch,
  IconBuildingSkyscraper,
  IconShieldLock,
  IconCoin,
  IconDeviceLaptop,
} from "@tabler/icons-react";

import type { IconComponent } from "@/components/ui/icon";
import type { IssueStatus } from "@/components/ui/status-badge";

export type Category = {
  slug: string;
  label: string;
  icon: IconComponent;
};

export const CATEGORIES: Category[] = [
  { slug: "shidduchim", label: "Shidduchim", icon: IconHeartHandshake },
  { slug: "education", label: "Education", icon: IconSchool },
  { slug: "yeshiva", label: "Yeshiva", icon: IconBook2 },
  { slug: "seminary", label: "Seminary", icon: IconBooks },
  { slug: "kollel", label: "Kollel", icon: IconBuildingBank },
  { slug: "chesed", label: "Chesed", icon: IconGift },
  { slug: "housing", label: "Housing", icon: IconBuildingCommunity },
  { slug: "safety", label: "Safety", icon: IconShieldCheck },
  { slug: "kashrus", label: "Kashrus", icon: IconCertificate },
  { slug: "eruv", label: "Eruv", icon: IconRoute },
  { slug: "bikur-cholim", label: "Bikur Cholim", icon: IconHeartbeat },
  { slug: "tomchei-shabbos", label: "Tomchei Shabbos", icon: IconShoppingBag },
  { slug: "mikvah", label: "Mikvah", icon: IconDroplet },
  { slug: "simchas-events", label: "Simchas & Events", icon: IconConfetti },
  { slug: "transportation", label: "Transportation", icon: IconBus },
  { slug: "employment-parnassah", label: "Employment & Parnassah", icon: IconBriefcase },
  { slug: "mental-health", label: "Mental Health", icon: IconBrain },
  { slug: "special-needs", label: "Special Needs", icon: IconWheelchair },
  { slug: "youth-camps", label: "Youth & Camps", icon: IconTent },
  { slug: "eldercare", label: "Eldercare", icon: IconArmchair },
  { slug: "shul-minyan", label: "Shul & Minyan", icon: IconBuildingChurch },
  { slug: "zoning-development", label: "Zoning & Development", icon: IconBuildingSkyscraper },
  { slug: "security", label: "Security", icon: IconShieldLock },
  { slug: "tzedaka-finance", label: "Tzedaka & Finance", icon: IconCoin },
  { slug: "technology-media", label: "Technology & Media", icon: IconDeviceLaptop },
];

export const LOCATIONS = [
  "Worldwide",
  "Lakewood",
  "Monsey",
  "Boro Park",
  "Flatbush",
  "Five Towns",
  "Jerusalem",
  "Bnei Brak",
] as const;

export type Location = (typeof LOCATIONS)[number];

export type IntentTag = "just-support" | "resonates" | "willing-to-help" | "stay-updated";

export const INTENT_TAGS: { value: IntentTag; label: string }[] = [
  { value: "just-support", label: "I just support this" },
  { value: "resonates", label: "This deeply resonates with me" },
  { value: "willing-to-help", label: "I'm willing to help" },
  { value: "stay-updated", label: "I want to stay updated" },
];

export type Comment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  replies?: Comment[];
};

export type SolutionStatus = "proposed" | "considering" | "trending" | "chosen" | "rejected";

export type Solution = {
  id: string;
  displayCode: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  votes: number;
  status: SolutionStatus;
  comments: Comment[];
  hidden?: boolean;
  deleted?: boolean;
  reviewStatus?: "pending" | "approved" | "rejected";
  submitter?: { name: string; email: string; phone?: string };
};

export type ActionTaskStatus =
  | "not-started"
  | "in-progress"
  | "needs-financing"
  | "stuck"
  | "done";

export type ActionTask = {
  id: string;
  title: string;
  status: ActionTaskStatus;
  hidden?: boolean;
};

export type ActionTeamMember = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  hidden: boolean;
};

export type ActionPlan = {
  id: string;
  tasks: ActionTask[];
  lead: string;
  volunteers: string[];
  teamMembers: ActionTeamMember[];
};

export type Update = {
  date: string;
  body: string;
};

export type Issue = {
  id: string;
  displayCode: string;
  communityId?: string;
  title: string;
  description: string;
  descriptionMore?: string;
  categorySlug: string;
  locationArea: Location;
  location: string;
  status: IssueStatus;
  supporterCount: number;
  shareCount: number;
  visitCount: number;
  viewCount: number;
  createdBy: string;
  createdAt: string;
  solutions: Solution[];
  chosenSolutionIds?: string[];
  updates: Update[];
  discussion: Comment[];
  actionPlan?: ActionPlan;
  visibility: "public" | "private";
  showOnHomepage: boolean;
  showInSearch: boolean;
  supportRequiresLogin: boolean;
  voteRequiresLogin: boolean;
  allowSuggestSolutions: boolean;
  commentsEnabled: boolean;
  commentsRequireLogin: boolean;
  actionPlanVisible: boolean;
  goLiveDate?: string;
  votingCloseDate?: string;
  hiddenDate?: string;
  /** Breakdown of supporterCount by intent level, shown in the sidebar info popover. */
  supporterBreakdown?: { justSupport: number; resonates: number; willingToHelp: number };
  links?: { id: string; label: string; url: string }[];
  /** Whether non-admins can still see the other (non-chosen) solutions once one is picked. Default true. */
  showHiddenSolutionsAfterChosen?: boolean;
  /** Set once the one-time "first solution marked chosen" prompt has fired for this issue. */
  firstChosenPromptedAt?: string | null;
};

export function getCategory(slug: string): Category {
  return CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES[0];
}
