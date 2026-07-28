import {
  IconBuildingCommunity,
  IconLeaf,
  IconSchool,
  IconRoad,
  IconHeartHandshake,
  IconShieldCheck,
} from "@tabler/icons-react";

import type { IconComponent } from "@/components/ui/icon";
import type { IssueStatus } from "@/components/ui/status-badge";

export type Category = {
  slug: string;
  label: string;
  icon: IconComponent;
};

export const CATEGORIES: Category[] = [
  { slug: "housing", label: "Housing", icon: IconBuildingCommunity },
  { slug: "environment", label: "Environment", icon: IconLeaf },
  { slug: "education", label: "Education", icon: IconSchool },
  { slug: "infrastructure", label: "Infrastructure", icon: IconRoad },
  { slug: "social-care", label: "Social Care", icon: IconHeartHandshake },
  { slug: "safety", label: "Safety", icon: IconShieldCheck },
];

export type IntentTag = "resonates" | "wants-to-join" | "passionate" | "willing-to-volunteer";

export const INTENT_TAGS: { value: IntentTag; label: string }[] = [
  { value: "resonates", label: "This resonates with me" },
  { value: "wants-to-join", label: "I want to join" },
  { value: "passionate", label: "I'm passionate about this" },
  { value: "willing-to-volunteer", label: "I'm willing to volunteer" },
];

export type Comment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  replies?: Comment[];
};

export type Solution = {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  votes: number;
  status: "proposed" | "in-progress" | "chosen" | "rejected";
  comments: Comment[];
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
};

export type ActionPlan = {
  tasks: ActionTask[];
  lead: string;
  volunteers: string[];
};

export type Update = {
  date: string;
  body: string;
};

export type Issue = {
  id: string;
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  location: string;
  status: IssueStatus;
  supporterCount: number;
  createdBy: string;
  splashTone: "coral" | "amber" | "blue" | "violet" | "green" | "slate";
  solutions: Solution[];
  chosenSolutionId?: string;
  updates: Update[];
  discussion: Comment[];
  actionPlan?: ActionPlan;
};

export const ISSUES: Issue[] = [
  {
    id: "1",
    slug: "pothole-epidemic-elm-street",
    title: "Pothole epidemic on Elm Street",
    description:
      "Three cars damaged this month. Residents want the city to prioritize repaving before winter sets in and the potholes get worse.",
    categorySlug: "infrastructure",
    location: "Downtown / Elm Street",
    status: "new",
    supporterCount: 12,
    createdBy: "Dana R.",
    splashTone: "slate",
    solutions: [],
    updates: [],
    discussion: [
      {
        id: "c1",
        author: "Marcus T.",
        body: "Hit one of these last week and bent a rim. Something needs to change.",
        createdAt: "2 days ago",
      },
    ],
  },
  {
    id: "2",
    slug: "community-garden-at-vacant-lot",
    title: "Turn the vacant lot on 5th into a community garden",
    description:
      "That lot has sat empty for six years. A community garden could give the block fresh produce and a reason to gather.",
    categorySlug: "environment",
    location: "Riverside / 5th & Ash",
    status: "gaining-traction",
    supporterCount: 87,
    createdBy: "Priya K.",
    splashTone: "green",
    solutions: [
      {
        id: "s1",
        title: "City-leased plots with a volunteer steering committee",
        description:
          "The city leases the lot to a resident-run nonprofit for $1/year, plots are assigned by lottery, and a steering committee handles rules and maintenance.",
        pros: ["No direct cost to the city", "Precedent exists in 3 other neighborhoods"],
        cons: ["Requires a nonprofit to be formed first", "Water access needs to be installed"],
        votes: 34,
        status: "proposed",
        comments: [],
      },
    ],
    updates: [],
    discussion: [
      {
        id: "c2",
        author: "Priya K.",
        body: "Talked to the city parks office — they're open to a lease agreement if we can show community support.",
        createdAt: "5 days ago",
      },
    ],
  },
  {
    id: "3",
    slug: "after-school-tutoring-shortage",
    title: "Not enough after-school tutoring slots at Lincoln Elementary",
    description:
      "The waitlist for free after-school tutoring has tripled since last year. Working parents need reliable options.",
    categorySlug: "education",
    location: "Lincoln Elementary district",
    status: "solutions-proposed",
    supporterCount: 156,
    createdBy: "Wendell A.",
    splashTone: "amber",
    solutions: [
      {
        id: "s2",
        title: "Recruit retired teachers as paid part-time tutors",
        description:
          "Partner with the district to pay retired teachers a stipend for 2 sessions/week, using existing classroom space after hours.",
        pros: ["Retired teachers already certified", "Uses existing space, no new facility cost"],
        cons: ["Stipend needs a funding source", "Scheduling around teachers' availability"],
        votes: 61,
        status: "proposed",
        comments: [
          {
            id: "c3",
            author: "Retired teacher, Ms. Ortiz",
            body: "I'd sign up for this tomorrow. Several colleagues would too.",
            createdAt: "1 week ago",
          },
        ],
      },
      {
        id: "s3",
        title: "High school peer-tutoring credit program",
        description:
          "High schoolers earn service-learning credit by tutoring elementary students 3 afternoons a week, supervised by one paid coordinator.",
        pros: ["Very low cost — mostly volunteer hours", "Builds a pipeline of future mentors"],
        cons: ["Needs reliable high-schooler transportation", "Quality depends on training"],
        votes: 43,
        status: "proposed",
        comments: [],
      },
    ],
    updates: [
      {
        date: "3 days ago",
        body: "District confirmed after-hours classroom space is available at no cost.",
      },
    ],
    discussion: [],
  },
  {
    id: "4",
    slug: "crosswalk-safety-near-riverside-park",
    title: "Unsafe crosswalk near Riverside Park",
    description:
      "Two near-misses reported this month at the Park & 9th crossing. Kids walk this route to the pool every day in summer.",
    categorySlug: "safety",
    location: "Riverside / Park & 9th",
    status: "solution-chosen",
    supporterCount: 203,
    createdBy: "Angela F.",
    splashTone: "coral",
    solutions: [
      {
        id: "s4",
        title: "Install a raised crosswalk with flashing beacons",
        description:
          "A raised crosswalk forces cars to slow down, paired with pedestrian-activated flashing beacons for visibility at dusk.",
        pros: ["Proven to reduce vehicle speed at crossings", "City has done this at 2 other sites"],
        cons: ["~$40k cost", "3-4 week construction window"],
        votes: 128,
        status: "chosen",
        comments: [
          {
            id: "c4",
            author: "City traffic engineer",
            body: "This matches our standard treatment for school-adjacent crossings. Can move to design phase quickly.",
            createdAt: "2 weeks ago",
          },
        ],
      },
      {
        id: "s5",
        title: "Add a crossing guard during pool hours",
        description: "Station a paid crossing guard at the intersection during peak summer pool hours.",
        pros: ["Cheap and fast to start"],
        cons: ["Doesn't fix the underlying visibility problem", "Seasonal only"],
        votes: 39,
        status: "rejected",
        comments: [],
      },
    ],
    chosenSolutionId: "s4",
    updates: [
      { date: "1 week ago", body: "City council approved funding for the raised crosswalk." },
    ],
    discussion: [],
    actionPlan: {
      tasks: [
        { id: "t1", title: "Finalize engineering design", status: "done" },
        { id: "t2", title: "Secure city permits", status: "in-progress" },
        { id: "t3", title: "Order flashing beacon hardware", status: "needs-financing" },
        { id: "t4", title: "Schedule construction window", status: "not-started" },
      ],
      lead: "Angela F.",
      volunteers: ["Marcus T.", "Priya K.", "Wendell A."],
    },
  },
  {
    id: "5",
    slug: "food-desert-eastside",
    title: "Eastside has no grocery store within walking distance",
    description:
      "The nearest full grocery store is a 45-minute bus ride. Residents rely on the corner gas station for food.",
    categorySlug: "housing",
    location: "Eastside",
    status: "in-action",
    supporterCount: 341,
    createdBy: "Terrence O.",
    splashTone: "violet",
    solutions: [
      {
        id: "s6",
        title: "Weekly mobile farmers market with SNAP matching",
        description:
          "A weekly mobile market brings fresh produce to the community center parking lot, with SNAP benefits matched dollar-for-dollar up to $20.",
        pros: ["Can launch in weeks, not years", "SNAP match already funded by state grant"],
        cons: ["Doesn't replace a full grocery store long-term"],
        votes: 210,
        status: "chosen",
        comments: [],
      },
    ],
    chosenSolutionId: "s6",
    updates: [
      { date: "3 weeks ago", body: "First market day drew over 300 residents." },
      { date: "1 week ago", body: "State SNAP-match grant renewed for another 6 months." },
    ],
    discussion: [
      {
        id: "c5",
        author: "Terrence O.",
        body: "This is already making a real difference for my neighbors. Thank you all.",
        createdAt: "4 days ago",
      },
    ],
    actionPlan: {
      tasks: [
        { id: "t5", title: "Secure community center parking lot permit", status: "done" },
        { id: "t6", title: "Line up produce vendors", status: "done" },
        { id: "t7", title: "Launch weekly market", status: "in-progress" },
        { id: "t8", title: "Apply for permanent storefront grant", status: "stuck" },
      ],
      lead: "Terrence O.",
      volunteers: ["Dana R.", "Angela F.", "Ms. Ortiz"],
    },
  },
  {
    id: "6",
    slug: "playground-equipment-maple-park",
    title: "Broken playground equipment at Maple Park",
    description:
      "The main slide has been fenced off for over a year after a safety inspection failure. Kids have nowhere to play.",
    categorySlug: "housing",
    location: "Maple Park",
    status: "resolved",
    supporterCount: 174,
    createdBy: "Grace L.",
    splashTone: "blue",
    solutions: [
      {
        id: "s7",
        title: "Community fundraiser + city matching grant for new equipment",
        description:
          "Raise $15k from residents, matched dollar-for-dollar by a city parks improvement grant, to fully replace the play structure.",
        pros: ["City matching grant already exists for exactly this"],
        cons: ["Fundraising takes coordinated effort"],
        votes: 98,
        status: "chosen",
        comments: [],
      },
    ],
    chosenSolutionId: "s7",
    updates: [
      { date: "2 months ago", body: "Fundraiser hit its $15k goal in three weeks." },
      { date: "3 weeks ago", body: "New play structure installed and passed inspection." },
    ],
    discussion: [],
    actionPlan: {
      tasks: [
        { id: "t9", title: "Run community fundraiser", status: "done" },
        { id: "t10", title: "Apply for city matching grant", status: "done" },
        { id: "t11", title: "Install new equipment", status: "done" },
        { id: "t12", title: "Pass safety inspection", status: "done" },
      ],
      lead: "Grace L.",
      volunteers: ["Dana R.", "Marcus T."],
    },
  },
];

export function getCategory(slug: string): Category {
  return CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES[0];
}

export function getIssue(slug: string): Issue | undefined {
  return ISSUES.find((i) => i.slug === slug);
}
