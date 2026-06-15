"use client";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores";
import { AnthroponymFormData, anthroponymSchema } from "@/schemas";
import { useAddAnthroponym, useUpdateAnthroponym } from "@/hooks";
import { 
  Button, 
  Input, 
  Textarea, 
  ButtonSubmit, 
  Switch, 
  SelectField,
  FormSection 
} from "@/components";
import { gender as genderOptions } from "@/constants";

interface AnthroponymFormContentProps {
  action: "add" | "edit";
  currentAnthroponym?: any;
}

export function AnthroponymFormContent({ action, currentAnthroponym }: AnthroponymFormContentProps) {
  const { closeModal } = useModal();
  const { mutateAsync: addAnthroponym, isPending: isAdding } = useAddAnthroponym();
  const { mutateAsync: updateAnthroponym, isPending: isUpdating } = useUpdateAnthroponym();
  const isPending = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AnthroponymFormData>({
    resolver: zodResolver(anthroponymSchema),
    defaultValues: {
      isVocabulary: false,
      isVocabularyEP: false,
      isForeignism: false,
    }
  });

  useEffect(() => {
    if (action === "edit" && currentAnthroponym) {
      reset(currentAnthroponym);
    } else {
      reset({
        isVocabulary: false,
        isVocabularyEP: false,
        isForeignism: false,
      });
    }
  }, [action, currentAnthroponym, reset]);

  async function onSubmit(data: AnthroponymFormData) {
    try {
      if (action === "add") {
        await addAnthroponym(data);
      } else if (currentAnthroponym) {
        await updateAnthroponym({ id: currentAnthroponym.id, data });
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
    <form id="anthroponym-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-4 px-1 max-h-[70vh] scrollbar-thin">
      <FormSection title="Informação do Nome" icon="User">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nome Próprio"
            startIcon="User"
            {...register("name")}
            error={errors.name?.message}
            placeholder="Ex: Manuel"
          />
          <Controller
            control={control}
            name="gender"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Género"
                value={value}
                options={genderOptions}
                onValueChange={onChange}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Apelido/Sobrenome"
            startIcon="Users"
            {...register("surname")}
            error={errors.surname?.message}
            placeholder="Ex: dos Santos"
          />
          <Input
            label="Significado do Apelido"
            startIcon="Info"
            {...register("surnameMeaning")}
            error={errors.surnameMeaning?.message}
          />
        </div>
      </FormSection>

      <FormSection title="Origem e Significado" icon="History">
        <Input
          label="Etimologia"
          startIcon="History"
          {...register("etymology")}
          error={errors.etymology?.message}
          placeholder="Ex: Do latim..."
        />
        <Textarea
          label="Significado do Nome"
          {...register("meaning")}
          error={errors.meaning?.message}
          rows={3}
        />
      </FormSection>

      <FormSection title="Contexto Histórico" icon="Crown">
        <Input
          label="Figura Histórica Associada"
          startIcon="UserCheck"
          {...register("historicalFigure")}
          error={errors.historicalFigure?.message}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Pseudónimo da Figura"
            startIcon="User"
            {...register("historicalFigurePseudonym")}
            error={errors.historicalFigurePseudonym?.message}
          />
          <Input
            label="Domínio de Atuação"
            startIcon="Briefcase"
            {...register("historicalFigureDomain")}
            error={errors.historicalFigureDomain?.message}
            placeholder="Ex: Política, Literatura..."
          />
        </div>
      </FormSection>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-4 bg-muted/40 rounded-xl border border-border/50">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-0.5">
            <span className="text-sm font-semibold">É VONALP?</span>
            <span className="text-xs text-muted-foreground">Faz parte do vocabulário VONALP?</span>
          </div>
          <Controller
            control={control}
            name="isVocabulary"
            render={({ field: { value, onChange } }) => (
              <Switch checked={value} onCheckedChange={onChange} />
            )}
          />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-0.5">
            <span className="text-sm font-semibold">É VONALP-EP?</span>
            <span className="text-xs text-muted-foreground">Faz parte do vocabulário VONALP-EP?</span>
          </div>
          <Controller
            control={control}
            name="isVocabularyEP"
            render={({ field: { value, onChange } }) => (
              <Switch checked={value} onCheckedChange={onChange} />
            )}
          />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-0.5">
            <span className="text-sm font-semibold">Estrangeirismo</span>
            <span className="text-xs text-muted-foreground">O vocábulo é de origem estrangeira?</span>
          </div>
          <Controller
            control={control}
            name="isForeignism"
            render={({ field: { value, onChange } }) => (
              <Switch checked={value} onCheckedChange={onChange} />
            )}
          />
        </div>
      </section>
    </form>
  );
}
