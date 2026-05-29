import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { icons } from "lucide-react";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

interface InputFetchProps {
  startIcon?: keyof typeof icons;
  label: string;
  endpoint: string;
  displayFields?: string[];
  onValueChange?: (value: string | number, fullObject?: Option | null) => void;
  placeholder?: string;
  debounceMs?: number;
  minChars?: number;
  value?: string;
}

interface Option {
  id: number | string;
  [key: string]: any;
}

export const InputFetch = forwardRef<HTMLInputElement, InputFetchProps>(({
  startIcon: StartIcon,
  label,
  endpoint,
  displayFields = ["name"],
  onValueChange,
  placeholder = "Digite para buscar...",
  debounceMs = 300,
  minChars = 2,
  value: propValue, // Rename to avoid conflict
}, ref) => {
  const [inputValue, setInputValue] = useState(propValue || "");
  const [debouncedValue] = useDebounce(inputValue, debounceMs);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const internalRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => internalRef.current!);

  useEffect(() => {
    if (propValue !== undefined) {
      setInputValue(propValue);
      if (propValue === "") {
        setSelectedOption(null);
      }
    }
  }, [propValue]);

  const {
    data: options = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["input-fetch", endpoint, debouncedValue],
    queryFn: async () => {
      if (debouncedValue.trim().length < minChars) return [];

      const response = await api.get(
        `${endpoint}?search=${encodeURIComponent(debouncedValue)}`
      );
      const responseData = response.data;

      let results = [];
      if (responseData && typeof responseData === "object") {
        if (Array.isArray(responseData.data)) {
          results = responseData.data;
        } else if (Array.isArray(responseData)) {
          results = responseData;
        }
      }

      console.log(`✅ ${results.length} resultados encontrados:`, results);
      return results;
    },
    enabled: debouncedValue.trim().length >= minChars,
    staleTime: 1000 * 60 * 5,
  });

  // Abre o dropdown quando houver resultados e o input tiver foco
  useEffect(() => {
    if (options.length > 0 && inputValue.trim().length >= minChars) {
      setIsOpen(true);
    } else if (!loading && inputValue.trim().length >= minChars) {
      setIsOpen(true); // Mantém aberto para mostrar "Nenhum resultado"
    }
  }, [options, inputValue, minChars, loading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Se o utilizador está a escrever algo diferente da selecção, limpa a selecção
    if (selectedOption) {
      setSelectedOption(null);
      console.log("Selecção limpa - utilizador voltou a escrever");
    }

    // O valor digitado é sempre notificado ao componente pai
    if (onValueChange) {
      onValueChange(value, null);
    }
  };

  const handleSelectOption = (option: Option) => {
    const displayText = displayFields
      .map((field) => getNestedValue(option, field))
      .filter(Boolean)
      .join(" - ");

    setInputValue(displayText);
    setSelectedOption(option);
    setIsOpen(false);

    if (onValueChange) {
      onValueChange(option.id, option);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
    // TODO: Adicionar navegação por setas (ArrowUp, ArrowDown, Enter)
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  const renderOptionContent = (option: Option) => {
    return displayFields.map((field, index) => {
      const value = getNestedValue(option, field);

      if (!value) return null;

      return (
        <span key={field} className="block">
          {index === 0 ? (
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {value}
            </span>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {value}
            </span>
          )}
        </span>
      );
    });
  };

  // Log imediato quando selectedOption mudar
  useEffect(() => {
    if (selectedOption) {
      console.log("Estado actualizado: item da API seleccionado");
    }
  }, [selectedOption]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="w-full">
          <div className="relative">
            <Input
              ref={internalRef}
              startIcon={StartIcon}
              label={label}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (
                  inputValue.trim().length >= minChars &&
                  options.length > 0
                ) {
                  setIsOpen(true);
                }
              }}
              placeholder={placeholder}
              autoComplete="off"
              className={
                selectedOption ? "border-primary dark:border-primary" : ""
              }
            />
            {inputValue && !selectedOption && (
              <span className="absolute right-3 top-1/2 text-xs text-amber-500 dark:text-amber-400">
                Não registado
              </span>
            )}
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-60 overflow-auto">
          {loading ? (
            <div className="p-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : error ? (
            <div className="px-4 py-3 text-sm text-destructive text-center">
              ❌ Erro ao buscar dados
            </div>
          ) : options.length > 0 ? (
            options.map((option: Option) => (
              <div
                key={option.id}
                onClick={() => handleSelectOption(option)}
                className="px-4 py-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition border-b border-border last:border-b-0 first:rounded-t-lg last:rounded-b-lg"
              >
                {renderOptionContent(option)}
              </div>
            ))
          ) : inputValue.trim().length >= minChars ? (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              <div className="mb-1">Nenhum resultado encontrado</div>
              <div className="text-xs text-amber-500 dark:text-amber-400">
                O texto digitado será usado como valor
              </div>
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
});

/*

import { useState, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { icons } from "lucide-react";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

interface InputFetchProps {
  startIcon?: keyof typeof icons;
  label: string;
  endpoint: string;
  displayFields?: string[];
  onValueChange?: (value: string | number, fullObject?: Option | null) => void;
  placeholder?: string;
  debounceMs?: number;
  minChars?: number;
}

interface Option {
  id: number | string;
  [key: string]: any;
}

export function InputFetch({
  startIcon: StartIcon,
  label,
  endpoint,
  displayFields = ["name"],
  onValueChange,
  placeholder = "Digite para buscar...",
  debounceMs = 300,
  minChars = 2,
}: InputFetchProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [debouncedValue] = useDebounce(inputValue, debounceMs);
  const inputRef = useRef<HTMLInputElement>(null);

  const getNestedValue = useCallback((obj: any, path: string) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }, []);

  const { data: options = [], isLoading, error } = useQuery({
    queryKey: ["input-fetch", endpoint, debouncedValue],
    queryFn: async () => {
      const res = await api.get(
        `${endpoint}?search=${encodeURIComponent(debouncedValue)}`
      );
      return Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
    },
    enabled: debouncedValue.length >= minChars,
    staleTime: 1000 * 60 * 5,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSelectedOption(null);
    setIsOpen(true);
  };

  const handleSelect = (option: Option) => {
    const text = displayFields
      .map((field) => getNestedValue(option, field))
      .filter(Boolean)
      .join(" - ");

    setInputValue(text);
    setSelectedOption(option);
    setIsOpen(false);
    onValueChange?.(option.id, option);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="w-full">
          <Input
            ref={inputRef}
            startIcon={StartIcon}
            label={label}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => inputValue.length >= minChars && setIsOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <div className="max-h-60 overflow-auto">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              A procurar...
            </div>
          )}

          {error && (
            <div className="px-4 py-3 text-sm text-destructive text-center">
              Erro ao buscar
            </div>
          )}

          {!isLoading && options.length === 0 && inputValue.length >= minChars && (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              Nenhum resultado encontrado
            </div>
          )}

          {options.map((option: any) => (
            <div
              key={option.id}
              onClick={() => handleSelect(option)}
              className="px-4 py-3 cursor-pointer hover:bg-accent"
            >
              {displayFields.map((field) => (
                <div key={field}>
                  {getNestedValue(option, field)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

*/
