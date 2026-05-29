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
  ButtonSubmit, 
  SelectField,
  FormSection 
} from "@/components";

interface UserFormContentProps {
  action: "add" | "edit";
  currentUser?: any;
}

const roleOptions = [
  { label: "Administrador", value: "ADMIN" },
  { label: "Supervisor", value: "SUPERVISOR" },
  { label: "Operador", value: "OPERATOR" },
];

export function UserFormContent({ action, currentUser }: UserFormContentProps) {
  const { closeModal } = useModal();
  const { mutateAsync: addUser, isPending: isAdding } = useAddUser();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();
  const isPending = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "OPERATOR",
      isActive: true,
    }
  });

  useEffect(() => {
    if (action === "edit" && currentUser) {
      reset({
        ...currentUser,
        password: "", // Never reset with hashed password
      });
    } else {
      reset({
        role: "OPERATOR",
        isActive: true,
      });
    }
  }, [action, currentUser, reset]);

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

  const handleCancel = () => {
    reset();
    closeModal(action === "add" ? "ADD_MODAL" : "EDIT_MODAL");
  };

  return (
    <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-4 px-1">
      <FormSection title="Perfil do Utilizador" icon="User">
        <Input
          label="Nome Completo"
          startIcon="User"
          {...register("name")}
          error={errors.name?.message}
          placeholder="Ex: João Silva"
        />
        <Input
          label="Endereço de Email"
          startIcon="Mail"
          {...register("email")}
          error={errors.email?.message}
          placeholder="exemplo@med.com"
        />
      </FormSection>

      <FormSection title="Segurança e Acesso" icon="Shield">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={action === "add" ? "Palavra-passe" : "Nova palavra-passe (opcional)"}
            type="password"
            startIcon="Lock"
            {...register("password")}
            error={errors.password?.message}
            placeholder="******"
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
    </form>
  );
}
