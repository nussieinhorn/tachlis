import type { Icon as TablerIconType, IconProps as TablerIconProps } from "@tabler/icons-react";

export type IconComponent = TablerIconType;

type IconProps = TablerIconProps & {
  icon: TablerIconType;
  /** "inline" (20px, default) for buttons/badges/list rows, "tile" (32px) for category picker tiles */
  variant?: "inline" | "tile";
};

const SIZE = {
  inline: 20,
  tile: 32,
} as const;

export function Icon({ icon: IconComponent, variant = "inline", size, stroke, ...props }: IconProps) {
  return (
    <IconComponent
      size={size ?? SIZE[variant]}
      stroke={stroke ?? 1.75}
      {...props}
    />
  );
}
