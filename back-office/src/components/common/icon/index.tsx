import { ComponentProps } from "react";
import { icons } from "lucide-react";

export type IconName = keyof typeof icons;

export type IconProps = ComponentProps<"button"> & {
  name: IconName;
  color?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function Icon({
  name,
  color,
  size,
  strokeWidth,
  className,
}: IconProps) {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return (
    <LucideIcon
      color={color}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}