import { Separator } from "@/components/ui/separator";

interface TitleListProps {
  title?: string;
  suTitle?: string;
  separator?: boolean;
  children?: React.ReactNode;
}

export function TitleList({
  title,
  suTitle,
  separator,
  children,
}: TitleListProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        {title && (
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        )}
        {suTitle && (
          <p className="text-sm text-muted-foreground mt-1">
            {suTitle}
          </p>
        )}
      </div>
      {separator && <Separator className="flex-1 hidden md:block" />}
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
