import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Option {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value?: string | number;
  placeholder?: string;
  options: Option[];
  onValueChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  error?: string;
}

export function SelectField({
  label,
  value,
  placeholder = "Seleccione",
  options,
  onValueChange,
  className,
  disabled = false,
  error,
}: SelectFieldProps) {
  // Radix Select doesn't accept empty string as value — pass undefined to show placeholder
  const safeValue = value === "" || value === undefined ? "__EMPTY__" : String(value);

  const handleValueChange = (val: string) => {
    onValueChange(val === "__EMPTY__" ? "" : val);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-sm font-medium">{label}</label>
      <Select
        value={safeValue}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          aria-invalid={!!error}
          className={cn(disabled && "opacity-50 cursor-not-allowed")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => {
            const val = opt.value === "" ? "__EMPTY__" : String(opt.value);
            return (
              <SelectItem key={val} value={val}>
                {opt.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-destructive mt-0.5">{error}</p>
      )}
    </div>
  );
}
