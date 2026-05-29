import { ReactNode } from "react";
import { Button } from "./button";
import { Icon } from "@/components/common";

type Props = {
  isLoading?: boolean;
  isPending?: boolean;
  children?: ReactNode;
  className?: string;
  form?: string;
  disabled?: boolean;
}

export function ButtonSubmit({ isLoading, isPending, children, className, form, disabled }: Props) {
  const loading = isLoading || isPending;
  return (
    <Button
      disabled={loading || disabled}
      type="submit"
      form={form}
      className={`${className}`}
    >
      {loading && <Icon className="animate-spin" name="LoaderCircle" />}
      {children}
    </Button>
  );
}
