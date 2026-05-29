"use client";
import Select from "react-select";

export interface SelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label: string;
  options: SelectOption[];
  value: SelectOption[];
  onChange: (options: SelectOption[]) => void;
  placeholder?: string;
  isMulti?: boolean;
  className?: string;
  error?: string;
  inputId?: string;
  isLoading?: boolean;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecionar...",
  isMulti = true,
  className,
  error,
  inputId,
  isLoading,
}: MultiSelectProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium mb-1">{label}</label>

      <Select<SelectOption, boolean>
        inputId={inputId}
        isMulti={isMulti}
        options={options}
        value={value}
        onChange={(val) => onChange((val as SelectOption[]) ?? [])}
        placeholder={placeholder}
        isLoading={isLoading}
        isClearable
        classNamePrefix="react-select"
        styles={selectStyles(error)}
      />

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}

function selectStyles(error?: string) {
  return {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "37px",
      borderRadius: "calc(var(--radius) - 2px)",
      borderColor: error
        ? "hsl(var(--destructive))"
        : state.isFocused
        ? "hsl(var(--ring))"
        : "hsl(var(--border))",
      backgroundColor: "hsl(var(--background))",
      boxShadow: state.isFocused
        ? error
          ? "0 0 0 1px hsl(var(--destructive))"
          : "0 0 0 1px hsl(var(--ring))"
        : "none",
      transition: "all 0.2s",
      "&:hover": {
        borderColor: error ? "hsl(var(--destructive))" : "hsl(var(--ring))",
      },
    }),

    valueContainer: (base: any) => ({
      ...base,
      padding: "2px 8px",
    }),

    input: (base: any) => ({
      ...base,
      color: "hsl(var(--foreground))",
    }),

    placeholder: (base: any) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
    }),

    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "hsl(var(--accent))",
      borderRadius: "var(--radius-sm)",
    }),

    multiValueLabel: (base: any) => ({
      ...base,
      color: "hsl(var(--foreground))",
    }),

    multiValueRemove: (base: any) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
      ":hover": {
        backgroundColor: "hsl(var(--destructive))",
        color: "hsl(var(--destructive-foreground))",
      },
    }),

    menu: (base: any) => ({
      ...base,
      borderRadius: "var(--radius)",
      backgroundColor: "hsl(var(--popover))",
      border: "1px solid hsl(var(--border))",
      boxShadow:
        "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      overflow: "hidden",
      zIndex: 9999,
    }),

    menuList: (base: any) => ({
      ...base,
      padding: "4px",
    }),

    option: (base: any, state: any) => ({
      ...base,
      borderRadius: "var(--radius-sm)",
      backgroundColor: state.isSelected
        ? "hsl(var(--primary))"
        : state.isFocused
        ? "hsl(var(--accent))"
        : "transparent",
      color: state.isSelected
        ? "hsl(var(--primary-foreground))"
        : "hsl(var(--foreground))",
      cursor: "pointer",
      padding: "10px 12px",
      ":active": {
        backgroundColor: "hsl(var(--primary))",
        color: "hsl(var(--primary-foreground))",
      },
    }),
  };
}
