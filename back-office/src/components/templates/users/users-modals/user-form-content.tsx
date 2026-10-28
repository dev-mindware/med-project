"use client";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores";
import { UserFormData, userSchema } from "@/schemas";
import { useAddUser, useUpdateUser } from "@/hooks";
import { 
  Button, 
  Input, 
  SelectField,
  FormSection,
  Icon 
} from "@/components";
import { Badge } from "@/components/ui/badge";

interface UserFormContentProps {
  action: "add" | "edit";
  currentUser?: any;
}

const roleOptions = [
  { label: "Administrador (Acesso Total)", value: "ADMIN" },
  { label: "Supervisor (Revisão & Escopo)", value: "SUPERVISOR" },
  { label: "Operador (Inserção & Edição)", value: "OPERATOR" },
];

const ALPHABET = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];

const LETTER_PRESETS = [
  { label: "Todas (A-Z)", letters: ALPHABET },
  { label: "A - E", letters: ["A", "B", "C", "D", "E"] },
  { label: "F - J", letters: ["F", "G", "H", "I", "J"] },
  { label: "K - O", letters: ["K", "L", "M", "N", "O"] },
  { label: "P - T", letters: ["P", "Q", "R", "S", "T"] },
  { label: "U - Z", letters: ["U", "V", "W", "X", "Y", "Z"] },
];

export function UserFormContent({ action, currentUser }: UserFormContentProps) {
  const { closeModal } = useModal();
  const { mutateAsync: addUser, isPending: isAdding } = useAddUser();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "OPERATOR",
      isActive: true,
      assignedLetters: [],
    }
  });

  const selectedRole = watch("role");
  const assignedLetters = watch("assignedLetters") || [];

  useEffect(() => {
    if (action === "edit" && currentUser) {
      reset({
        ...currentUser,
        assignedLetters: currentUser.assignedLetters || [],
        password: "", // Never reset with hashed password
      });
    } else {
      reset({
        role: "OPERATOR",
        isActive: true,
        assignedLetters: [],
      });
    }
  }, [action, currentUser, reset]);

  const toggleLetter = (letter: string) => {
    const current = assignedLetters || [];
    if (current.includes(letter)) {
      setValue("assignedLetters", current.filter((l) => l !== letter), { shouldDirty: true });
    } else {
      setValue("assignedLetters", [...current, letter].sort(), { shouldDirty: true });
    }
  };

  const applyPreset = (letters: string[]) => {
    setValue("assignedLetters", [...letters].sort(), { shouldDirty: true });
  };

  const clearLetters = () => {
    setValue("assignedLetters", [], { shouldDirty: true });
  };

  async function onSubmit(data: UserFormData) {
    try {
      if (action === "add") {
        await addUser(data);
      } else if (currentUser) {
        await updateUser({ id: currentUser.id, data });
      }
      closeModal(action === "add" ? "ADD_MODAL" : "EDIT_MODAL");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Ocorreu um erro ao guardar");
    }
  }

  return (
    <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4 px-1">
      {/* ── Perfil do Utilizador ────────────────────────────────────────── */}
      <FormSection title="Perfil do Utilizador" icon="User">
        <Input
          label="Nome Completo"
          startIcon="User"
          {...register("name")}
          error={errors.name?.message}
          placeholder="Ex: Manuel António"
        />
        <Input
          label="Endereço de Email"
          startIcon="Mail"
          {...register("email")}
          error={errors.email?.message}
          placeholder="exemplo@med.gov.ao"
        />
      </FormSection>

      {/* ── Segurança e Função ─────────────────────────────────────────── */}
      <FormSection title="Segurança e Acesso" icon="Shield">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={action === "add" ? "Palavra-passe" : "Nova palavra-passe (opcional)"}
            type="password"
            startIcon="Lock"
            {...register("password")}
            error={errors.password?.message}
            placeholder="Mínimo 6 caracteres"
          />
          <Controller
            control={control}
            name="role"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Nível de Acesso"
                value={value}
                options={roleOptions}
                onValueChange={onChange}
                error={errors.role?.message}
              />
            )}
          />
        </div>
      </FormSection>

      {/* ── Escopo Alfabético de Entradas (Para Supervisores & Operadores) ── */}
      {(selectedRole === "SUPERVISOR" || selectedRole === "OPERATOR") && (
        <FormSection title="Âmbito Lexicográfico por Letra Inicial" icon="Bookmark">
          <div className="space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Com mais de <strong>250.000 entradas</strong> no acervo, selecione as letras iniciais
                pelas quais este utilizador responderá (ex: <em>Supervisor 1 cuida da letra A</em>, etc.).
              </p>
              <div className="flex items-center gap-1.5 shrink-0">
                {assignedLetters.length > 0 ? (
                  <Badge variant="default" className="text-xs font-semibold px-2 py-0.5">
                    {assignedLetters.length} letra{assignedLetters.length > 1 ? "s" : ""} activa{assignedLetters.length > 1 ? "s" : ""}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground px-2 py-0.5">
                    Acesso Geral (A-Z)
                  </Badge>
                )}
              </div>
            </div>

            {/* Presets de Intervalos */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-muted-foreground mr-1">
                Atalhos rápidos:
              </span>
              {LETTER_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset.letters)}
                  className="px-2 py-0.5 text-xs rounded-md bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/50"
                >
                  {preset.label}
                </button>
              ))}
              {assignedLetters.length > 0 && (
                <button
                  type="button"
                  onClick={clearLetters}
                  className="px-2 py-0.5 text-xs rounded-md bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors ml-1"
                >
                  Limpar selecção
                </button>
              )}
            </div>

            {/* Teclado / Grelha Alfabética A-Z */}
            <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-13 gap-1.5 p-3 bg-muted/20 dark:bg-muted/10 rounded-xl border border-border/70">
              {ALPHABET.map((letter) => {
                const isSelected = assignedLetters.includes(letter);
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => toggleLetter(letter)}
                    className={`
                      h-10 text-sm font-bold rounded-lg flex items-center justify-center transition-all duration-150 select-none border
                      ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.03] ring-2 ring-primary/30"
                          : "bg-background/80 hover:bg-muted/80 text-foreground/80 hover:text-foreground border-border/70"
                      }
                    `}
                    title={`Entradas iniciadas por ${letter}`}
                  >
                    <span>{letter}</span>
                  </button>
                );
              })}
            </div>

            {/* Legenda Informativa */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40">
              <Icon name="Info" className="w-4 h-4 text-primary shrink-0" />
              <span>
                {assignedLetters.length > 0 ? (
                  <>
                    Este supervisor só visualizará e supervisionará entradas que comecem por:{" "}
                    <strong className="text-foreground">{assignedLetters.join(", ")}</strong>.
                  </>
                ) : (
                  <>
                    Nenhuma letra específica selecionada. O supervisor terá supervisão de todas as entradas do acervo (A a Z).
                  </>
                )}
              </span>
            </div>
          </div>
        </FormSection>
      )}
    </form>
  );
}
