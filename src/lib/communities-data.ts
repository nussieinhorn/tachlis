import { ISSUES } from "@/lib/mock-data";

export type CommunityTone = "coral" | "amber" | "blue" | "violet" | "green" | "slate";

export const COMMUNITY_TONE_CLASSES: Record<CommunityTone, string> = {
  coral: "bg-[#f45d48]",
  amber: "bg-[#d98c1f]",
  blue: "bg-[#3b7dd8]",
  violet: "bg-[#8b5cf6]",
  green: "bg-[#2f9e5b]",
  slate: "bg-[#8a8178]",
};

export type Community = {
  id: string;
  name: string;
  description: string;
  location: string;
  privacy: "public" | "private";
  memberCount: number;
  tone: CommunityTone;
  /** Fake session user's email who created this community. Seed communities are ownerless. */
  ownerId?: string;
};

// TODO(supabase): communities table — id, name, description, location,
// privacy, member_count (derived from a memberships join table), owner_id.
export const COMMUNITIES: Community[] = [
  {
    id: "c101",
    name: "Boro Park Merchants Association",
    description: "Local business owners organizing around shared neighborhood issues.",
    location: "Boro Park, Brooklyn",
    privacy: "public",
    memberCount: 214,
    tone: "coral",
  },
  {
    id: "c102",
    name: "Boro Park Chesed Council",
    description: "Coordinating chesed organizations across the neighborhood.",
    location: "Boro Park, Brooklyn",
    privacy: "public",
    memberCount: 356,
    tone: "green",
  },
  {
    id: "c103",
    name: "Five Towns Civic Association",
    description: "Residents working together on community-wide concerns.",
    location: "Five Towns, NY",
    privacy: "public",
    memberCount: 489,
    tone: "blue",
  },
  {
    id: "c104",
    name: "Five Towns Yeshiva Alumni",
    description: "Alumni network staying connected and supporting the yeshiva.",
    location: "Five Towns, NY",
    privacy: "private",
    memberCount: 132,
    tone: "slate",
  },
  {
    id: "c105",
    name: "Flatbush Community Council",
    description: "A civic voice for Flatbush residents on local issues.",
    location: "Flatbush, Brooklyn",
    privacy: "public",
    memberCount: 301,
    tone: "amber",
  },
  {
    id: "c106",
    name: "Bais Yaakov Parents Association",
    description: "Parent body supporting the Bais Yaakov community.",
    location: "Flatbush, Brooklyn",
    privacy: "private",
    memberCount: 87,
    tone: "violet",
  },
  {
    id: "c107",
    name: "West Gate Development",
    description: "New Lakewood development residents organizing on shared concerns.",
    location: "Lakewood, NJ",
    privacy: "public",
    memberCount: 176,
    tone: "coral",
  },
  {
    id: "c108",
    name: "Lakewood Kollel Families Network",
    description: "Support and community for kollel families in Lakewood.",
    location: "Lakewood, NJ",
    privacy: "private",
    memberCount: 268,
    tone: "green",
  },
  {
    id: "c109",
    name: "Yeshiva Gedola Beis Medrash Alumni",
    description: "Alumni of the beis medrash staying involved in yeshiva affairs.",
    location: "Lakewood, NJ",
    privacy: "public",
    memberCount: 412,
    tone: "blue",
  },
  {
    id: "c110",
    name: "The Commons at Cross County",
    description: "Residents of the Cross County development in Monsey.",
    location: "Monsey, NY",
    privacy: "public",
    memberCount: 143,
    tone: "amber",
  },
  {
    id: "c111",
    name: "Monsey Chesed Network",
    description: "Volunteers coordinating chesed efforts across Monsey.",
    location: "Monsey, NY",
    privacy: "private",
    memberCount: 198,
    tone: "slate",
  },
  {
    id: "c112",
    name: "Bnei Brak Kollel Association",
    description: "Supporting kollel families and infrastructure in Bnei Brak.",
    location: "Bnei Brak, Israel",
    privacy: "public",
    memberCount: 527,
    tone: "violet",
  },
  {
    id: "c113",
    name: "Ramat Eshkol Neighborhood",
    description: "Neighborhood association for Ramat Eshkol residents.",
    location: "Jerusalem",
    privacy: "public",
    memberCount: 245,
    tone: "coral",
  },
  {
    id: "c114",
    name: "Seminary Alumnae Circle",
    description: "Staying connected with seminary alumnae worldwide.",
    location: "Jerusalem",
    privacy: "public",
    memberCount: 601,
    tone: "green",
  },
  {
    id: "c115",
    name: "Park Heights Community",
    description: "A growing community hub for Park Heights residents.",
    location: "Baltimore, MD",
    privacy: "public",
    memberCount: 64,
    tone: "blue",
  },
];

export function getCommunity(id: string): Community | undefined {
  return COMMUNITIES.find((c) => c.id === id);
}

export function getCommunitiesOwnedBy(email: string): Community[] {
  return COMMUNITIES.filter((c) => c.ownerId === email);
}

export function getCommunityIssueCount(id: string): number {
  return ISSUES.filter((issue) => issue.communityId === id).length;
}
