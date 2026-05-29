import { Icon, type IconName } from "@/components/common";
import { type LucideIcon } from "lucide-react";

interface FormSectionProps {
  title: string;
  icon?: IconName | LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

export function FormSection({ title, icon, className = "", children }: FormSectionProps) {
  const IconComponent = typeof icon !== "string" ? (icon as LucideIcon) : null;

  return (
    <section className={`space-y-4 ${className}`}>
      <h3 className="text-sm font-semibold flex items-center gap-2 text-primary uppercase tracking-wider">
        {icon && (
          typeof icon === "string" ? (
            <Icon name={icon as IconName} className="w-4 h-4" />
          ) : IconComponent && (
            <IconComponent className="w-4 h-4" />
          )
        )}
        {title}
      </h3>
      {children}
    </section>
  );
}
