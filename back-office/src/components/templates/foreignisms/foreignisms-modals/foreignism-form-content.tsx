"use client";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores";
import { ForeignismFormData, foreignismSchema } from "@/schemas";
import { useAddForeignism, useUpdateForeignism } from "@/hooks";
import { Button, Input, Textarea, ButtonSubmit, SelectField, Switch } from "@/components";
import { grammatical_category } from "@/constants";

interface ForeignismFormContentProps {
  action: "add" | "edit";
  currentForeignism?: any;
}

const statusOptions = [
  { label: "Publicado", value: "PUBLISHED" },
  { label: "Rascunho", value: "DRAFT" },
  { label: "Arquivado", value: "ARCHIVED" },
  { label: "Em Revisão", value: "UNDER_REVIEW" },
];

export function ForeignismFormContent({ action, currentForeignism }: ForeignismFormContentProps) {
  const { closeModal } = useModal();
  const { mutateAsync: addForeignism, isPending: isAdding } = useAddForeignism();
  const { mutateAsync: updateForeignism, isPending: isUpdating } = useUpdateForeignism();
  const isPending = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ForeignismFormData>({
    resolver: zodResolver(foreignismSchema),
    defaultValues: {
      isVocabulary: false,
      isVocabularyEP: false,
    }
  });

  useEffect(() => {
    if (action === "edit" && currentForeignism) {
      reset(currentForeignism);
    } else {
      reset({
        isVocabulary: false,
        isVocabularyEP: false,
      });
    }
  }, [action, currentForeignism, reset]);

  async function onSubmit(data: ForeignismFormData) {
    try {
      if (action === "add") {
        await addForeignism(data);
      } else if (currentForeignism) {
        await updateForeignism({ id: currentForeignism.id, data });
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
    <form id="foreignism-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4 px-1">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Termo Estrangeiro"
          startIcon="Globe"
          {...register("term")}
          error={errors.term?.message}
          placeholder="Ex: Software"
        />
        <Input
          label="Pronúncia"
          startIcon="Mic"
          {...register("pronunciation")}
          error={errors.pronunciation?.message}
          placeholder="Ex: sóf-tuér"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Idioma Original"
          startIcon="Languages"
          {...register("originalLanguage")}
          error={errors.originalLanguage?.message}
          placeholder="Ex: Inglês"
        />
        <Input
          label="País de Origem"
          startIcon="MapPin"
          {...register("originCountry")}
          error={errors.originCountry?.message}
          placeholder="Ex: EUA"
        />
        <Input
          label="Área de Conhecimento"
          startIcon="Activity"
          {...register("field")}
          error={errors.field?.message}
          placeholder="Ex: Informática"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Forma Adaptada"
          {...register("adaptedForm")}
          error={errors.adaptedForm?.message}
          placeholder="Ex: Sofware (português)"
        />
        <Input
          label="Forma Original"
          {...register("originalForm")}
          error={errors.originalForm?.message}
          placeholder="Ex: Software (inglês)"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Textarea
          label="Significado"
          {...register("meaning")}
          error={errors.meaning?.message}
          placeholder="Breve explicação do significado..."
          rows={3}
        />
        <Textarea
          label="Definição"
          {...register("definition")}
          error={errors.definition?.message}
          placeholder="Definição detalhada..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Textarea
          label="Exemplo de Uso"
          {...register("usageExample")}
          error={errors.usageExample?.message}
          placeholder="Frase exemplificando o uso..."
          rows={3}
        />
        <Textarea
          label="Contexto"
          {...register("context")}
          error={errors.context?.message}
          placeholder="Contexto em que o termo é utilizado..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Input
          label="Abreviatura"
          {...register("abbreviation")}
          error={errors.abbreviation?.message}
        />
        <Input
          label="Acrónimo"
          {...register("acronym")}
          error={errors.acronym?.message}
        />
        <Input
          label="Redução"
          {...register("reduction")}
          error={errors.reduction?.message}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Forma Curta"
          {...register("shortForm")}
          error={errors.shortForm?.message}
        />
        <Input
          label="Forma Completa"
          {...register("fullForm")}
          error={errors.fullForm?.message}
        />
      </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Controller
          control={control}
          name="grammaticalCategory"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Categoria Gramatical"
              value={value}
              options={grammatical_category}
              onValueChange={onChange}
              error={errors.grammaticalCategory?.message}
            />
          )}
        />
      </div>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-4 bg-muted/40 rounded-xl border border-border/50 mt-4">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-0.5">
            <span className="text-sm font-semibold">É VONALP?</span>
            <span className="text-xs text-muted-foreground leading-tight">Faz parte do vocabulário VONALP?</span>
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
            <span className="text-xs text-muted-foreground leading-tight">Faz parte do vocabulário VONALP-EP?</span>
          </div>
          <Controller
            control={control}
            name="isVocabularyEP"
            render={({ field: { value, onChange } }) => (
              <Switch checked={value} onCheckedChange={onChange} />
            )}
          />
        </div>
      </section>
    </form>
  );
}
