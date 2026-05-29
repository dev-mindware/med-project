import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/common";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { icons } from "lucide-react";

type Option = { value: string; label: string };

interface FilterPopoverProps {
  label: string;
  icon: keyof typeof icons;
  options: Option[];
  value?: string | null;
  onChange: (value?: string | null) => void;
}

export function FilterPopover({
  label,
  icon,
  options,
  value,
  onChange,
}: FilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant={value ? "default" : "outline"}
          className="w-full h-10 gap-2 sm:w-auto"
        >
          <Icon name={icon} className="w-4 h-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 space-y-2">
        <p className="p-1 text-sm font-medium">
          Selecionar {label.toLowerCase()}
        </p>
        {options.map((opt) => (
          <div
            key={opt.value}
            role="button"
            tabIndex={0}
            className="flex items-center w-full gap-2 p-1.5 rounded hover:bg-muted text-left transition-colors group cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              const isSelected = value === opt.value;
              onChange(isSelected ? null : opt.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const isSelected = value === opt.value;
                onChange(isSelected ? null : opt.value);
              }
            }}
          >
            <Checkbox
              id={`${label}-${opt.value}`}
              checked={value === opt.value}
              className="pointer-events-none"
            />
            <span className="text-sm font-normal text-muted-foreground group-hover:text-foreground">
              {opt.label}
            </span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
