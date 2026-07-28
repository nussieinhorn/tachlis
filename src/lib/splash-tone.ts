export type SplashTone = "coral" | "amber" | "blue" | "violet" | "green" | "slate";

export const SPLASH_TONE_CLASSES: Record<SplashTone, string> = {
  coral: "bg-gradient-to-br from-[#f45d48] to-[#c73a2a]",
  amber: "bg-gradient-to-br from-[#d98c1f] to-[#a3660f]",
  blue: "bg-gradient-to-br from-[#3b7dd8] to-[#254e8c]",
  violet: "bg-gradient-to-br from-[#8b5cf6] to-[#5b32b8]",
  green: "bg-gradient-to-br from-[#2f9e5b] to-[#1c6e3d]",
  slate: "bg-gradient-to-br from-[#8a8178] to-[#5c554d]",
};
