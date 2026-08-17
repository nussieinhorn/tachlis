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
  IconSparkles,
} from "@tabler/icons-react";

import type { IconComponent } from "@/components/ui/icon";

/** Fixed, compact set of icons an admin can pick from when adding a category on the fly. */
export const CATEGORY_ICON_OPTIONS: { slug: string; icon: IconComponent }[] = [
  { slug: "heart-handshake", icon: IconHeartHandshake },
  { slug: "school", icon: IconSchool },
  { slug: "book", icon: IconBook2 },
  { slug: "books", icon: IconBooks },
  { slug: "bank", icon: IconBuildingBank },
  { slug: "gift", icon: IconGift },
  { slug: "community", icon: IconBuildingCommunity },
  { slug: "shield-check", icon: IconShieldCheck },
  { slug: "certificate", icon: IconCertificate },
  { slug: "route", icon: IconRoute },
  { slug: "heartbeat", icon: IconHeartbeat },
  { slug: "shopping-bag", icon: IconShoppingBag },
  { slug: "droplet", icon: IconDroplet },
  { slug: "confetti", icon: IconConfetti },
  { slug: "bus", icon: IconBus },
  { slug: "briefcase", icon: IconBriefcase },
  { slug: "brain", icon: IconBrain },
  { slug: "wheelchair", icon: IconWheelchair },
  { slug: "tent", icon: IconTent },
  { slug: "armchair", icon: IconArmchair },
  { slug: "building-church", icon: IconBuildingChurch },
  { slug: "building-skyscraper", icon: IconBuildingSkyscraper },
  { slug: "shield-lock", icon: IconShieldLock },
  { slug: "coin", icon: IconCoin },
  { slug: "laptop", icon: IconDeviceLaptop },
];

const DEFAULT_ICON = IconSparkles;

export function getCategoryIcon(iconSlug: string | null | undefined): IconComponent {
  return CATEGORY_ICON_OPTIONS.find((o) => o.slug === iconSlug)?.icon ?? DEFAULT_ICON;
}
