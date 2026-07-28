import {
  IconHeartHandshake,
  IconSchool,
  IconBook2,
  IconBooks,
  IconBuildingBank,
  IconGift,
  IconBuildingCommunity,
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
  { slug: "shidduchim", label: "Shidduchim", icon: IconHeartHandshake },
  { slug: "education", label: "Education", icon: IconSchool },
  { slug: "yeshiva", label: "Yeshiva", icon: IconBook2 },
  { slug: "seminary", label: "Seminary", icon: IconBooks },
  { slug: "kollel", label: "Kollel", icon: IconBuildingBank },
  { slug: "chesed", label: "Chesed", icon: IconGift },
  { slug: "housing", label: "Housing", icon: IconBuildingCommunity },
  { slug: "safety", label: "Safety", icon: IconShieldCheck },
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
  descriptionMore?: string;
  categorySlug: string;
  locationArea: Location;
  location: string;
  status: IssueStatus;
  supporterCount: number;
  createdBy: string;
  solutions: Solution[];
  chosenSolutionId?: string;
  updates: Update[];
  discussion: Comment[];
  actionPlan?: ActionPlan;
};

export const ISSUES: Issue[] = [
  // ---- NEW ----
  {
    id: "1",
    slug: "no-apartments-boro-park-growing-families",
    title: "No available apartments for growing families in Boro Park",
    description:
      "Three-bedroom apartments in the 15th Ave / 50th St area have a waitlist of over a year. Young families are being pushed out to neighborhoods far from their parents and shuls.",
    descriptionMore:
      "Local machers have floated the idea of a new mid-rise development on the old lumber yard site, but zoning has stalled for two years. Meanwhile, at least a dozen families known to the poster have moved to Lakewood or Monsey purely because they couldn't find a 3-bedroom within walking distance of their parents.",
    categorySlug: "housing",
    locationArea: "Boro Park",
    location: "Boro Park, Brooklyn",
    status: "new",
    supporterCount: 34,
    createdBy: "Yitzy G.",
    solutions: [],
    updates: [],
    discussion: [
      {
        id: "c1",
        author: "Chaim W.",
        body: "We've been on three waitlists since Pesach. This is a real crisis, not an exaggeration.",
        createdAt: "Yesterday",
      },
    ],
  },
  {
    id: "2",
    slug: "shidduch-resource-night-five-towns",
    title: "Need a community shidduch resource night in Five Towns",
    description:
      "Girls finishing seminary and boys finishing beis medrash have no central place to get guidance on the process. A once-a-month resource night with experienced shadchanim could fill a real gap.",
    descriptionMore:
      "The idea would be modeled after similar programs already running quietly in Chicago and the Five Towns Y — a rotating panel of shadchanim, mashpiim, and recently-married couples answering questions in a low-pressure setting, not an actual shidduch event.",
    categorySlug: "shidduchim",
    locationArea: "Five Towns",
    location: "Five Towns, NY",
    status: "new",
    supporterCount: 21,
    createdBy: "Devorah L.",
    solutions: [],
    updates: [],
    discussion: [],
  },
  {
    id: "3",
    slug: "postseminary-job-training-flatbush",
    title: "Post-seminary girls lack job training resources in Flatbush",
    description:
      "Girls coming back from seminary in Israel are expected to start earning within months, but there's no structured path into teaching, therapy, or office skills locally.",
    descriptionMore:
      "A few seminaries run informal placement help, but nothing coordinated across the community. Parents are footing the bill for private tutoring certifications that could be run as a single community-wide course.",
    categorySlug: "seminary",
    locationArea: "Flatbush",
    location: "Flatbush, Brooklyn",
    status: "new",
    supporterCount: 18,
    createdBy: "Miriam K.",
    solutions: [],
    updates: [],
    discussion: [],
  },
  {
    id: "4",
    slug: "beis-medrash-space-shortage-lakewood",
    title: "Not enough shiur space for growing beis medrash in Lakewood",
    description:
      "Enrollment has outgrown the current building by nearly 200 bochurim. Afternoon sedorim are now split across three overflow rooms with poor acoustics.",
    descriptionMore:
      "The yeshiva administration has looked at the adjacent lot but the purchase price has more than doubled since last discussed. A capital campaign hasn't been formally launched yet, pending community buy-in.",
    categorySlug: "yeshiva",
    locationArea: "Lakewood",
    location: "Lakewood, NJ",
    status: "new",
    supporterCount: 47,
    createdBy: "Reb Shloime F.",
    solutions: [],
    updates: [],
    discussion: [],
  },
  {
    id: "5",
    slug: "welcoming-committee-five-towns",
    title: "New families need a welcoming committee in Five Towns",
    description:
      "Families moving in from out of town have no consistent way to find a shul, a minyan, school openings, or even a good butcher. Word of mouth only goes so far.",
    descriptionMore:
      "A simple welcome packet plus a rotating list of volunteer families willing to host a first Shabbos meal could make a huge difference for retention — several families have moved back out within a year of arriving, citing isolation.",
    categorySlug: "chesed",
    locationArea: "Five Towns",
    location: "Five Towns, NY",
    status: "new",
    supporterCount: 15,
    createdBy: "Ahuva S.",
    solutions: [],
    updates: [],
    discussion: [],
  },

  // ---- GAINING TRACTION ----
  {
    id: "6",
    slug: "affordable-housing-young-families-lakewood",
    title: "Affordable housing crisis for young Lakewood families",
    description:
      "Starter homes that sold for $280k five years ago are now well past $550k. Kollel and young working families can no longer afford to buy within walking distance of a shul.",
    descriptionMore:
      "This has become the top complaint at nearly every town hall in the past year. Several ideas are circulating — from a community-backed subsidized mortgage fund to lobbying the township for higher-density zoning near Route 9 — but nothing has been formally proposed until now.",
    categorySlug: "housing",
    locationArea: "Lakewood",
    location: "Lakewood, NJ",
    status: "gaining-traction",
    supporterCount: 312,
    createdBy: "Yanky R.",
    solutions: [
      {
        id: "s1",
        title: "Community-backed low-interest mortgage fund",
        description:
          "A gemach-style fund, seeded by local philanthropists and matched with a low-interest bank partnership, that offers young families a second mortgage to bridge the down-payment gap.",
        pros: ["Doesn't require township approval to start", "Similar funds exist in Monsey and Boro Park"],
        cons: ["Needs a large seed donation to be meaningful", "Underwriting takes real financial expertise"],
        votes: 156,
        status: "proposed",
        comments: [
          { id: "c-s1-1", author: "Reb Moshe T.", body: "I know two askanim who'd seed this immediately if there's a real plan.", createdAt: "2 days ago" },
        ],
      },
      {
        id: "s2",
        title: "Lobby the township for higher-density zoning near Route 9",
        description:
          "Push the township committee to rezone the corridor near Route 9 for townhomes and smaller lots, increasing starter-home supply directly.",
        pros: ["Addresses supply, not just financing", "Long-term structural fix"],
        cons: ["Township politics move slowly", "Likely opposition from existing homeowners"],
        votes: 98,
        status: "proposed",
        comments: [],
      },
      {
        id: "s3",
        title: "Community land trust for first-time buyers",
        description:
          "The community buys land and leases it long-term to young families at below-market rates, keeping the home price itself affordable indefinitely.",
        pros: ["Keeps homes affordable permanently, not just once", "Model proven in other frum communities"],
        cons: ["Requires significant upfront capital", "Complex legal structure to set up"],
        votes: 74,
        status: "proposed",
        comments: [],
      },
      {
        id: "s4",
        title: "Shared-equity co-purchase program with local shuls",
        description:
          "Shuls with endowment funds co-invest in a home purchase with a young family in exchange for a share of future appreciation.",
        pros: ["Uses capital shuls already have", "Aligns shul and family incentives"],
        cons: ["Some shuls may be uncomfortable with the financial exposure"],
        votes: 41,
        status: "proposed",
        comments: [],
      },
      {
        id: "s5",
        title: "Rent-to-own pilot with local developers",
        description:
          "Partner with a developer building new units to offer a rent-to-own structure, letting families build equity while renting instead of saving a lump-sum down payment.",
        pros: ["Lower barrier to entry than a traditional mortgage"],
        cons: ["Only works with developer buy-in", "Fewer precedents to point to"],
        votes: 29,
        status: "proposed",
        comments: [],
      },
    ],
    updates: [
      { date: "Today", body: "Township committee agreed to hear a formal zoning proposal next month." },
      { date: "Yesterday", body: "Two additional askanim pledged seed funding for the mortgage fund idea." },
      { date: "3 days ago", body: "Over 300 households signed the community petition." },
    ],
    discussion: [
      { id: "c6-1", author: "Yanky R.", body: "Please keep sharing this — the more names on the petition, the more seriously the township takes it.", createdAt: "Today" },
      { id: "c6-2", author: "Bracha M.", body: "We almost left Lakewood entirely over this. Grateful this is finally being organized.", createdAt: "Yesterday" },
    ],
  },
  {
    id: "7",
    slug: "shidduch-crisis-shadchanim-flatbush",
    title: "Shidduch crisis: not enough shadchanim for post-seminary girls in Flatbush",
    description:
      "Dozens of girls finishing seminary each year are relying on the same handful of overworked shadchanim, with wait times stretching past six months for a first suggestion.",
    descriptionMore:
      "A few younger women in the community have offered informally to help but have no training or structured way to plug in. There's an opportunity to formalize a mentorship pipeline for new shadchanim.",
    categorySlug: "shidduchim",
    locationArea: "Flatbush",
    location: "Flatbush, Brooklyn",
    status: "gaining-traction",
    supporterCount: 189,
    createdBy: "Raizy H.",
    solutions: [
      {
        id: "s6",
        title: "Shadchan mentorship & training program",
        description:
          "Pair experienced shadchanim with 10-15 interested younger women for a structured 6-month mentorship, expanding the active shadchan pool.",
        pros: ["Directly increases capacity", "Low cost to start"],
        cons: ["Takes months before new shadchanim are effective"],
        votes: 88,
        status: "proposed",
        comments: [],
      },
      {
        id: "s7",
        title: "Shared community shidduch database",
        description:
          "A privacy-respecting, opt-in database that shadchanim can search together instead of each keeping private lists, reducing duplicated effort.",
        pros: ["Makes existing shadchanim far more efficient"],
        cons: ["Privacy concerns need to be handled very carefully"],
        votes: 61,
        status: "proposed",
        comments: [],
      },
    ],
    updates: [
      { date: "Today", body: "Three experienced shadchanim agreed to lead the first mentorship cohort." },
      { date: "2 days ago", body: "Initial interest form collected over 40 responses from girls and mentors combined." },
    ],
    discussion: [],
  },
  {
    id: "8",
    slug: "tuition-crisis-lakewood-families",
    title: "Tuition crisis pushing families to the brink in Lakewood",
    description:
      "With five or six children in yeshiva at once, even dual-income families are taking on debt just to cover tuition. Scholarship committees are overwhelmed and inconsistent between schools.",
    descriptionMore:
      "Several schools have begun quietly comparing notes on a shared scholarship framework, but nothing formal has launched. Families report the application process itself as invasive and demoralizing.",
    categorySlug: "education",
    locationArea: "Lakewood",
    location: "Lakewood, NJ",
    status: "gaining-traction",
    supporterCount: 271,
    createdBy: "Aryeh B.",
    solutions: [
      {
        id: "s8",
        title: "Shared, standardized scholarship application across schools",
        description:
          "One application and one financial review process shared by participating schools, so families don't have to repeat the same invasive process five times.",
        pros: ["Cuts administrative burden for families and schools alike"],
        cons: ["Requires schools to agree on shared standards"],
        votes: 143,
        status: "proposed",
        comments: [],
      },
      {
        id: "s9",
        title: "Community tuition assistance endowment",
        description:
          "A dedicated, professionally managed endowment fund that supplements school scholarship budgets community-wide.",
        pros: ["Reduces pressure on any single school's budget"],
        cons: ["Takes years to build a meaningful endowment"],
        votes: 97,
        status: "proposed",
        comments: [],
      },
    ],
    updates: [
      { date: "Yesterday", body: "Four school menahalim met to discuss a shared application framework." },
    ],
    discussion: [
      { id: "c8-1", author: "Aryeh B.", body: "This affects nearly every family I know. Please keep supporting this.", createdAt: "Today" },
    ],
  },
  {
    id: "9",
    slug: "kollel-cost-of-living-lakewood",
    title: "Kollel families struggling with rising cost of living in Lakewood",
    description:
      "Kollel stipends haven't kept pace with rent and grocery prices, which have risen sharply over the past three years. Many families rely entirely on outside chesed to get by.",
    descriptionMore:
      "Some are calling for a broader conversation about whether stipend levels should be indexed to local cost of living, similar to how some out-of-town kollelim already operate.",
    categorySlug: "kollel",
    locationArea: "Lakewood",
    location: "Lakewood, NJ",
    status: "gaining-traction",
    supporterCount: 204,
    createdBy: "Reb Yankel P.",
    solutions: [
      {
        id: "s10",
        title: "Index kollel stipends to local cost-of-living",
        description: "Adjust stipend levels annually based on a local cost-of-living index instead of a fixed amount.",
        pros: ["Keeps pace automatically with rising costs"],
        cons: ["Requires new funding sources to sustain"],
        votes: 112,
        status: "proposed",
        comments: [],
      },
    ],
    updates: [{ date: "2 days ago", body: "Several roshei kollel agreed to discuss the proposal at their next meeting." }],
    discussion: [],
  },
  {
    id: "10",
    slug: "eruv-lighting-flatbush",
    title: "Better lighting needed on Rugby Road walking route in Flatbush",
    description:
      "Families walking to shul on Shabbos along Rugby Road have reported feeling unsafe after dark during winter months, when there's almost no working streetlight for two full blocks.",
    descriptionMore:
      "Residents have submitted 311 requests to the city for over a year with no response. A community-funded solar lighting solution has been raised as a faster alternative.",
    categorySlug: "safety",
    locationArea: "Flatbush",
    location: "Flatbush, Brooklyn",
    status: "gaining-traction",
    supporterCount: 133,
    createdBy: "Shulamis D.",
    solutions: [
      {
        id: "s11",
        title: "Community-funded solar streetlights",
        description: "Install solar-powered lights on the two darkest blocks, bypassing the city's timeline entirely.",
        pros: ["Can be installed within weeks, no city approval needed for private property edges"],
        cons: ["Ongoing maintenance is the community's responsibility"],
        votes: 79,
        status: "proposed",
        comments: [],
      },
      {
        id: "s12",
        title: "Organized pressure campaign on the city council member",
        description: "A coordinated letter and call campaign to the local council member's office to prioritize the outstanding 311 tickets.",
        pros: ["No cost to the community"],
        cons: ["City timelines are unpredictable"],
        votes: 44,
        status: "proposed",
        comments: [],
      },
    ],
    updates: [],
    discussion: [],
  },

  // ---- SOLUTIONS PROPOSED ----
  {
    id: "11",
    slug: "basement-apartment-shortage-monsey",
    title: "Basement apartment shortage leaving newlyweds stuck at parents'",
    description:
      "New couples in Monsey are waiting six-plus months for a basement apartment to open up, with many staying with parents far longer than planned.",
    descriptionMore:
      "A few homeowners have expressed interest in legally converting basements but are unsure of the permitting process and cost.",
    categorySlug: "housing",
    locationArea: "Monsey",
    location: "Monsey, NY",
    status: "solutions-proposed",
    supporterCount: 96,
    createdBy: "Esti N.",
    solutions: [
      {
        id: "s13",
        title: "Community guide + subsidized permitting for basement conversions",
        description:
          "Publish a clear step-by-step guide for legally converting a basement into a rental unit, plus a small community fund to offset permit fees for the first 20 homeowners who commit.",
        pros: ["Directly increases supply using existing housing stock", "Low cost per unit created"],
        cons: ["Some homes aren't structurally suited for conversion"],
        votes: 67,
        status: "proposed",
        comments: [
          { id: "c-s13-1", author: "Homeowner, Yossi K.", body: "I'd convert mine tomorrow if I understood the permit process.", createdAt: "1 day ago" },
        ],
      },
      {
        id: "s14",
        title: "Matching service for newlyweds and homeowners with open basements",
        description: "A simple opt-in list connecting homeowners willing to rent with newlywed couples searching, run by a volunteer coordinator.",
        pros: ["Can launch immediately with no cost"],
        cons: ["Doesn't grow the actual housing supply"],
        votes: 29,
        status: "proposed",
        comments: [],
      },
    ],
    updates: [{ date: "Today", body: "A local contractor offered to do a free info session on the permitting process." }],
    discussion: [],
  },
  {
    id: "12",
    slug: "dating-guidance-bochurim-lakewood",
    title: "Yeshiva bochurim have no structured dating guidance in Lakewood",
    description:
      "Once bochurim start dating, many report feeling completely unprepared, with no one formally walking them through what to expect or how to communicate.",
    descriptionMore:
      "A few rebbeim currently do this informally for their own talmidim, but there's no consistent program available to bochurim outside those specific shiurim.",
    categorySlug: "shidduchim",
    locationArea: "Lakewood",
    location: "Lakewood, NJ",
    status: "solutions-proposed",
    supporterCount: 58,
    createdBy: "Reb Dovid M.",
    solutions: [
      {
        id: "s15",
        title: "Optional pre-dating chaburah led by rebbeim and recently married alumni",
        description: "A short, optional series of evening sessions for bochurim who are about to start dating, run by a mix of rebbeim and recently married alumni.",
        pros: ["Uses trusted voices bochurim already respect"],
        cons: ["Requires volunteer time from busy rebbeim"],
        votes: 37,
        status: "proposed",
        comments: [],
      },
    ],
    updates: [],
    discussion: [],
  },
  {
    id: "13",
    slug: "kollel-stipend-expansion-bnei-brak",
    title: "Need expanded kollel stipend program in Bnei Brak",
    description:
      "Several smaller kollelim in Bnei Brak have stipend waitlists of their own, turning away avreichim who want to learn but can't afford to without support.",
    descriptionMore:
      "A shared fund across multiple kollelim, rather than each raising separately, has been proposed as a more efficient path forward.",
    categorySlug: "kollel",
    locationArea: "Bnei Brak",
    location: "Bnei Brak, Israel",
    status: "solutions-proposed",
    supporterCount: 71,
    createdBy: "Reb Yisroel Z.",
    solutions: [
      {
        id: "s16",
        title: "Shared multi-kollel stipend fund",
        description: "A single pooled fund distributed across participating kollelim based on need, rather than each fundraising separately.",
        pros: ["More efficient fundraising, less donor fatigue"],
        cons: ["Requires kollelim to agree on a shared distribution formula"],
        votes: 48,
        status: "proposed",
        comments: [],
      },
    ],
    updates: [],
    discussion: [],
  },

  // ---- SOLUTION CHOSEN ----
  {
    id: "14",
    slug: "overcrowded-cheder-boro-park",
    title: "Overcrowded classrooms at the Boro Park cheder",
    description:
      "Kindergarten classes are running 28 boys to one rebbi, well above the recommended ratio, after two straight years of enrollment growth outpacing the building.",
    descriptionMore:
      "The school board approved renting adjacent space starting this coming school year, ending an eight-month back-and-forth over cost.",
    categorySlug: "education",
    locationArea: "Boro Park",
    location: "Boro Park, Brooklyn",
    status: "solution-chosen",
    supporterCount: 142,
    createdBy: "Menachem O.",
    solutions: [
      {
        id: "s17",
        title: "Rent adjacent storefront space for two additional classrooms",
        description: "Lease the vacant storefront next door and renovate it into two additional kindergarten classrooms, splitting the largest classes in half.",
        pros: ["Fastest path to lower class sizes", "Building is literally next door"],
        cons: ["Ongoing rent adds to school budget"],
        votes: 91,
        status: "chosen",
        comments: [
          { id: "c-s17-1", author: "Menahel, Rabbi Klein", body: "Lease is signed. Renovation begins after Pesach.", createdAt: "3 days ago" },
        ],
      },
      {
        id: "s18",
        title: "Split into a morning and afternoon shift",
        description: "Run two shorter kindergarten shifts in the existing space instead of adding a room.",
        pros: ["No new rent needed"],
        cons: ["Shorter learning day for each shift", "Logistically hard for working parents"],
        votes: 22,
        status: "rejected",
        comments: [],
      },
    ],
    chosenSolutionId: "s17",
    updates: [
      { date: "Today", body: "Contractor walkthrough completed, renovation quote came in on budget." },
      { date: "3 days ago", body: "Lease signed for the adjacent storefront." },
      { date: "1 week ago", body: "School board voted to move forward with the rental option." },
    ],
    discussion: [],
    actionPlan: {
      tasks: [
        { id: "t1", title: "Sign lease for adjacent space", status: "done" },
        { id: "t2", title: "Contractor walkthrough & quote", status: "done" },
        { id: "t3", title: "Renovation permits", status: "in-progress" },
        { id: "t4", title: "Hire second kindergarten rebbi", status: "needs-financing" },
      ],
      lead: "Rabbi Klein",
      volunteers: ["Menachem O.", "Chaim W."],
    },
  },
  {
    id: "15",
    slug: "yeshiva-building-renovation-jerusalem",
    title: "Yeshiva building needs urgent renovation in Jerusalem",
    description:
      "The main beis medrash roof has been leaking for two winters, and the electrical system was flagged as a fire hazard by an inspector last month.",
    descriptionMore:
      "An emergency campaign raised enough for phase one (the roof and electrical) within three weeks, with phase two (heating system) still pending.",
    categorySlug: "yeshiva",
    locationArea: "Jerusalem",
    location: "Jerusalem",
    status: "solution-chosen",
    supporterCount: 218,
    createdBy: "Rosh Yeshiva's office",
    solutions: [
      {
        id: "s19",
        title: "Emergency two-phase renovation campaign",
        description: "Raise funds in two phases — roof and electrical first for safety, heating system second — rather than waiting to fund everything at once.",
        pros: ["Fixes the most dangerous issues immediately"],
        cons: ["Heating system delay means a cold phase two winter"],
        votes: 134,
        status: "chosen",
        comments: [],
      },
    ],
    chosenSolutionId: "s19",
    updates: [
      { date: "Yesterday", body: "Phase one funding goal reached — roof work begins next week." },
      { date: "4 days ago", body: "Electrical inspection report shared with the full kehilla." },
    ],
    discussion: [
      { id: "c15-1", author: "Alumnus, Reb Aharon", body: "Gave from out of town — this yeshiva raised me, the least I could do.", createdAt: "2 days ago" },
    ],
    actionPlan: {
      tasks: [
        { id: "t5", title: "Emergency electrical repair", status: "done" },
        { id: "t6", title: "Roof replacement", status: "in-progress" },
        { id: "t7", title: "Phase two: heating system", status: "needs-financing" },
      ],
      lead: "Rosh Yeshiva's office",
      volunteers: ["Reb Aharon", "Reb Yisroel Z."],
    },
  },
  {
    id: "16",
    slug: "bikur-cholim-volunteers-boro-park",
    title: "Bikur cholim volunteers stretched thin in Boro Park",
    description:
      "The local bikur cholim has seen a 40% rise in requests this year with almost no growth in its volunteer base, leaving some families waiting days for meal coverage.",
    descriptionMore:
      "A recruitment and scheduling overhaul was chosen over simply asking existing volunteers to do more, to avoid burning out the core team that's been carrying the load for years.",
    categorySlug: "chesed",
    locationArea: "Boro Park",
    location: "Boro Park, Brooklyn",
    status: "solution-chosen",
    supporterCount: 165,
    createdBy: "Bikur Cholim coordinator",
    solutions: [
      {
        id: "s20",
        title: "Structured volunteer recruitment + shift-based scheduling app",
        description: "Run a formal recruitment drive through shuls and schools, paired with a simple shift-scheduling tool so no single volunteer is overloaded.",
        pros: ["Spreads the load evenly", "Scheduling tool prevents double-booking or gaps"],
        cons: ["Needs someone to manage the recruitment drive"],
        votes: 103,
        status: "chosen",
        comments: [],
      },
    ],
    chosenSolutionId: "s20",
    updates: [
      { date: "Today", body: "27 new volunteers signed up after the shul announcements this past Shabbos." },
      { date: "5 days ago", body: "Scheduling app selected and being configured." },
    ],
    discussion: [],
    actionPlan: {
      tasks: [
        { id: "t8", title: "Select scheduling tool", status: "done" },
        { id: "t9", title: "Recruitment drive through shuls", status: "done" },
        { id: "t10", title: "Onboard and train new volunteers", status: "in-progress" },
        { id: "t11", title: "Launch full shift schedule", status: "not-started" },
      ],
      lead: "Bikur Cholim coordinator",
      volunteers: ["Chaya R.", "Devorah L.", "Ahuva S."],
    },
  },
  {
    id: "17",
    slug: "unsafe-crosswalk-bnei-brak-yeshiva",
    title: "Unsafe crosswalk near the Bnei Brak yeshiva",
    description:
      "Bochurim crossing to get to seder have had two near-misses this month at the unmarked crossing near the yeshiva gate, where cars regularly speed through.",
    descriptionMore:
      "The municipality approved a raised crosswalk after a delegation of parents and the yeshiva administration met with the local council.",
    categorySlug: "safety",
    locationArea: "Bnei Brak",
    location: "Bnei Brak, Israel",
    status: "solution-chosen",
    supporterCount: 187,
    createdBy: "Yeshiva administration",
    solutions: [
      {
        id: "s21",
        title: "Install a raised, marked crosswalk with signage",
        description: "A raised crosswalk with clear signage forces cars to slow at the yeshiva gate crossing.",
        pros: ["Municipality has approved and funded it", "Proven design used elsewhere in the city"],
        cons: ["Construction requires a short full road closure"],
        votes: 121,
        status: "chosen",
        comments: [],
      },
    ],
    chosenSolutionId: "s21",
    updates: [{ date: "3 days ago", body: "Municipality confirmed construction start date." }],
    discussion: [],
    actionPlan: {
      tasks: [
        { id: "t12", title: "Municipal approval", status: "done" },
        { id: "t13", title: "Schedule road closure", status: "in-progress" },
        { id: "t14", title: "Install crosswalk and signage", status: "not-started" },
      ],
      lead: "Yeshiva administration",
      volunteers: ["Reb Yisroel Z."],
    },
  },

  // ---- IN ACTION ----
  {
    id: "18",
    slug: "special-needs-resources-monsey-schools",
    title: "Special needs students need more resources in Monsey schools",
    description:
      "Several schools have identified students who would benefit from a dedicated resource room but currently share one overstretched specialist across three buildings.",
    descriptionMore:
      "A shared regional resource program, funded jointly by participating schools plus a state grant, is now being rolled out school by school.",
    categorySlug: "education",
    locationArea: "Monsey",
    location: "Monsey, NY",
    status: "in-action",
    supporterCount: 176,
    createdBy: "Mrs. Feldman",
    solutions: [
      {
        id: "s22",
        title: "Shared regional resource program across participating schools",
        description: "Pool funding across schools to hire two additional specialists shared regionally, plus apply for a state special education grant to offset cost.",
        pros: ["State grant covers roughly half the cost"],
        cons: ["Coordinating schedules across schools takes real logistics work"],
        votes: 118,
        status: "chosen",
        comments: [],
      },
    ],
    chosenSolutionId: "s22",
    updates: [
      { date: "Today", body: "First specialist started this week at the largest school." },
      { date: "Yesterday", body: "State grant funding officially confirmed." },
      { date: "6 days ago", body: "Second specialist hired, starting after winter break." },
    ],
    discussion: [
      { id: "c18-1", author: "Mrs. Feldman", body: "So grateful to see this actually moving. Our kids can't wait another year.", createdAt: "Today" },
    ],
    actionPlan: {
      tasks: [
        { id: "t15", title: "Secure state grant", status: "done" },
        { id: "t16", title: "Hire first specialist", status: "done" },
        { id: "t17", title: "Hire second specialist", status: "in-progress" },
        { id: "t18", title: "Set shared rotation schedule", status: "not-started" },
      ],
      lead: "Mrs. Feldman",
      volunteers: ["Esti N.", "Yossi K."],
    },
  },
  {
    id: "19",
    slug: "seminary-transportation-jerusalem",
    title: "Seminary girls need safer transportation options in Jerusalem",
    description:
      "Girls walking back from evening chaburos have reported feeling unsafe on poorly lit streets near several seminary dorms.",
    descriptionMore:
      "A shared shuttle service between the main seminary buildings and dorm locations launched on a trial basis and is being expanded based on strong demand.",
    categorySlug: "seminary",
    locationArea: "Jerusalem",
    location: "Jerusalem",
    status: "in-action",
    supporterCount: 149,
    createdBy: "Seminary dean",
    solutions: [
      {
        id: "s23",
        title: "Shared evening shuttle between seminary buildings and dorms",
        description: "A small shuttle running set evening routes between seminary buildings and the main dorm clusters.",
        pros: ["Directly solves the safety concern", "Costs less than each seminary running its own"],
        cons: ["Requires coordinating a shared schedule across seminaries"],
        votes: 92,
        status: "chosen",
        comments: [],
      },
    ],
    chosenSolutionId: "s23",
    updates: [
      { date: "Yesterday", body: "Second shuttle van added after trial route reached capacity every night." },
      { date: "4 days ago", body: "Trial route launched with one van covering two dorm buildings." },
    ],
    discussion: [],
    actionPlan: {
      tasks: [
        { id: "t19", title: "Launch trial shuttle route", status: "done" },
        { id: "t20", title: "Add second van", status: "done" },
        { id: "t21", title: "Formalize funding for full year", status: "in-progress" },
      ],
      lead: "Seminary dean",
      volunteers: ["Miriam K."],
    },
  },
  {
    id: "20",
    slug: "eruv-repairs-lakewood",
    title: "Eruv repairs needed weekly before Shabbos in Lakewood",
    description:
      "The eastern stretch of the eruv has needed emergency repair almost every week this year, often discovered only hours before Shabbos.",
    descriptionMore:
      "A dedicated weekly Thursday-check rotation with a small paid checker has cut down last-minute Friday scrambles significantly since launching.",
    categorySlug: "safety",
    locationArea: "Lakewood",
    location: "Lakewood, NJ",
    status: "in-action",
    supporterCount: 231,
    createdBy: "Eruv committee",
    solutions: [
      {
        id: "s24",
        title: "Weekly Thursday check with a dedicated paid checker",
        description: "Hire a dedicated checker to walk the full eruv route every Thursday, catching problems with a full day to fix them instead of hours.",
        pros: ["Far fewer last-minute Friday emergencies since starting"],
        cons: ["Ongoing weekly cost to the community"],
        votes: 141,
        status: "chosen",
        comments: [],
      },
    ],
    chosenSolutionId: "s24",
    updates: [
      { date: "Today", body: "This week's check completed with no issues found — third clean week in a row." },
      { date: "1 week ago", body: "Dedicated checker officially hired and started." },
    ],
    discussion: [],
    actionPlan: {
      tasks: [
        { id: "t22", title: "Hire dedicated weekly checker", status: "done" },
        { id: "t23", title: "Set up Thursday check + Friday backup route", status: "done" },
        { id: "t24", title: "Build community funding subscription", status: "in-progress" },
      ],
      lead: "Eruv committee",
      volunteers: ["Reb Shloime F.", "Aryeh B."],
    },
  },

  // ---- RESOLVED ----
  {
    id: "21",
    slug: "bein-hazmanim-programming-five-towns",
    title: "Bein hazmanim programming lacking for bochurim in Five Towns",
    description:
      "Bochurim home for bein hazmanim had little structured to do, leading to concerns from parents about idle time between zmanim.",
    descriptionMore:
      "A two-week program of trips, chaburos, and chesed projects launched this past bein hazmanim to strong turnout and is now planned to repeat every break.",
    categorySlug: "yeshiva",
    locationArea: "Five Towns",
    location: "Five Towns, NY",
    status: "resolved",
    supporterCount: 88,
    createdBy: "Community Vaad",
    solutions: [
      {
        id: "s25",
        title: "Structured two-week bein hazmanim program",
        description: "A mix of organized trips, guest chaburos, and chesed projects to give bochurim structured, meaningful time during the break.",
        pros: ["Ran successfully with strong turnout"],
        cons: [],
        votes: 63,
        status: "chosen",
        comments: [],
      },
    ],
    chosenSolutionId: "s25",
    updates: [
      { date: "2 weeks ago", body: "Program wrapped up with over 60 bochurim participating across all events." },
      { date: "1 month ago", body: "Program launched with a chesed day and a Shabbaton." },
    ],
    discussion: [],
    actionPlan: {
      tasks: [
        { id: "t25", title: "Plan two-week schedule", status: "done" },
        { id: "t26", title: "Recruit guest speakers", status: "done" },
        { id: "t27", title: "Run program", status: "done" },
        { id: "t28", title: "Collect feedback for next break", status: "done" },
      ],
      lead: "Community Vaad",
      volunteers: ["Reb Dovid M.", "Yanky R."],
    },
  },
  {
    id: "22",
    slug: "tomchei-shabbos-drivers-monsey",
    title: "Tomchei Shabbos needs more volunteer drivers in Monsey",
    description:
      "A shortage of regular drivers meant some families were getting their weekly package hours before Shabbos instead of with time to prepare.",
    descriptionMore:
      "A recruitment push through the local schools brought in enough new drivers to fully restore the Wednesday-evening delivery schedule.",
    categorySlug: "chesed",
    locationArea: "Monsey",
    location: "Monsey, NY",
    status: "resolved",
    supporterCount: 104,
    createdBy: "Tomchei Shabbos coordinator",
    solutions: [
      {
        id: "s26",
        title: "School-based volunteer driver recruitment push",
        description: "Recruit parent volunteers directly through the local schools' weekly newsletters and carpool networks.",
        pros: ["Filled every open delivery slot within a month"],
        cons: [],
        votes: 71,
        status: "chosen",
        comments: [],
      },
    ],
    chosenSolutionId: "s26",
    updates: [
      { date: "3 weeks ago", body: "All delivery routes fully staffed again, back to Wednesday evening schedule." },
      { date: "5 weeks ago", body: "12 new volunteer drivers signed up in the first week of the push." },
    ],
    discussion: [
      { id: "c22-1", author: "Recipient family", body: "Getting our package with real time to prepare makes such a difference. Thank you to every driver.", createdAt: "2 weeks ago" },
    ],
    actionPlan: {
      tasks: [
        { id: "t29", title: "Recruit new drivers through schools", status: "done" },
        { id: "t30", title: "Rebuild full delivery schedule", status: "done" },
        { id: "t31", title: "Confirm all routes staffed", status: "done" },
      ],
      lead: "Tomchei Shabbos coordinator",
      volunteers: ["Chaya R.", "Bracha M."],
    },
  },
];

export function getCategory(slug: string): Category {
  return CATEGORIES.find((c) => c.slug === slug) ?? CATEGORIES[0];
}

export function getIssue(slug: string): Issue | undefined {
  return ISSUES.find((i) => i.slug === slug);
}
