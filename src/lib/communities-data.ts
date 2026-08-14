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
  ownerId?: string;
};
