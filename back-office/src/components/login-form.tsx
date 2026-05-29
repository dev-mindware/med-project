"use client";

import { useState } from "react";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/schemas/auth";
import { loginAction } from "@/actions/auth";
import { ErrorMessage } from "@/utils/messages";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/common/icon";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setIsPending(true);
    try {
      const result = await loginAction(data);
      if (result.success) {
        if (typeof window !== "undefined") {
          localStorage.setItem("medproject.user", JSON.stringify(result.user));
        }
        router.push("/dashboard"); 
      } else {
        ErrorMessage(result.message || "Erro ao realizar login");
      }
    } catch (error) {
      ErrorMessage("Erro inesperado. Tente novamente.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Acesse o Portal Linguístico
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            {...register("email")}
            disabled={isPending}
          />
          {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Palavra-passe</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline hidden"
            >
              Esqueceu-se da palavra-passe?
            </a>
          </div>
          <Input 
            id="password" 
            type="password" 
            {...register("password")}
            disabled={isPending}
            placeholder="*******"
          />
          {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
        </Field>
        <Field>
          <Button type="submit" disabled={isPending} className="flex gap-2 w-full font-semibold shadow-md transition-all hover:shadow-lg active:scale-[0.98]">
            {isPending && <Icon name="LoaderCircle" className="animate-spin w-4 h-4" />}
            Entrar
          </Button>
        </Field>
        <FieldSeparator className="hidden">Ou continue com</FieldSeparator>
        <Field className="hidden">
          <FieldDescription className="text-center hidden">
            Não tem uma conta?{" "}
            <a href="#" className="underline underline-offset-4">
              Registre-se
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
