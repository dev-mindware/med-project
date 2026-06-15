"use client";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EntryFormData, entrySchema } from "@/schemas";
import { useAddNeologism, useUpdateNeologism, useUploadMedia } from "@/hooks";
import { useModal } from "@/stores";
import { ErrorMessage } from "@/utils/messages";
import { ButtonSubmit, FormSection, Input, MediaUploadField, SelectField, Switch, Textarea } from "@/components";
import { grammatical_category, grammatical_status } from "@/constants/entries";

type NeologismFormContentProps = {
  action: "add" | "edit";
  currentNeologism?: any;
};

export function NeologismFormContent({ action, currentNeologism }: NeologismFormContentProps) {
  const { closeModal } = useModal();
  const { mutateAsync: addNeologism, isPending: isAdding } = useAddNeologism();
  const { mutateAsync: updateNeologism, isPending: isUpdating } = useUpdateNeologism();
  const { mutateAsync: uploadMedia, isPending: isUploadingMedia } = useUploadMedia();
  const isPending = isAdding || isUpdating || isUploadingMedia;

  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: { isVocabulary: false, isVocabularyEP: false, isForeignism: false },
  });

  const selectedCategoryValue = useWatch({ control, name: "grammaticalCategory" });
  const audioUrl = useWatch({ control, name: "audioUrl" });
  const imageUrl = useWatch({ control, name: "imageUrl" });
  const selectedCategory = grammatical_category.find((category) => category.value === selectedCategoryValue);
  const subcategoryOptions = selectedCategory?.subcategories || [];

  useEffect(() => {
    if (action === "edit" && currentNeologism) {
      reset(currentNeologism);
      return;
    }
    reset({ isVocabulary: false, isVocabularyEP: false, isForeignism: false });
  }, [action, currentNeologism, reset]);

  async function onSubmit(data: EntryFormData) {
    try {
      if (action === "add") {
        await addNeologism(data);
      } else if (currentNeologism) {
        await updateNeologism({ id: currentNeologism.id, data });
      }
      closeModal(action === "add" ? "NEOLOGISM_ADD_MODAL" : "NEOLOGISM_EDIT_MODAL");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Ocorreu um erro ao guardar");
    }
  }

  const handleMediaUpload = async (field: "audioUrl" | "imageUrl", file: File) => {
    try {
      const media = await uploadMedia({ file, entity: "neologisms", entityId: currentNeologism?.id });
      setValue(field, media.url, { shouldDirty: true, shouldValidate: true });
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Ocorreu um erro ao carregar a multimédia");
    }
  };

  return (
    <form id="neologism-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-4 px-1 max-h-[70vh] scrollbar-thin">
      <FormSection title="Informação Geral" icon="BookOpen">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Neologismo" startIcon="BookOpen" {...register("entry")} error={errors.entry?.message} placeholder="Ex: vocábulo novo" />
          <Input label="Código da Língua" startIcon="Languages" {...register("languageCode")} error={errors.languageCode?.message} placeholder="Ex: pt-AO" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Pronúncia" startIcon="Mic" {...register("pronunciation")} error={errors.pronunciation?.message} />
          <Input label="Divisão Silábica" startIcon="Scissors" {...register("syllabicDivision")} error={errors.syllabicDivision?.message} />
        </div>
        <Input label="Etimologia" startIcon="History" {...register("etymology")} error={errors.etymology?.message} />
      </FormSection>

      <FormSection title="Classificação Gramatical" icon="Tags">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Controller
            control={control}
            name="grammaticalCategory"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Categoria Gramatical"
                value={value}
                options={grammatical_category}
                onValueChange={(val) => {
                  onChange(val);
                  setValue("grammaticalSubcategory", "");
                }}
                error={errors.grammaticalCategory?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="grammaticalSubcategory"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Subcategoria"
                value={value}
                options={subcategoryOptions}
                onValueChange={onChange}
                disabled={!selectedCategoryValue || subcategoryOptions.length === 0}
                placeholder={subcategoryOptions.length === 0 ? "N/A" : "Seleccione"}
                error={errors.grammaticalSubcategory?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="grammaticalStatus"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Estado Gramatical"
                value={value}
                options={grammatical_status}
                onValueChange={onChange}
                error={errors.grammaticalStatus?.message}
              />
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Definições e Uso" icon="FileText">
        <Textarea label="Primeira Definição" {...register("firstDefinition")} error={errors.firstDefinition?.message} rows={3} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Textarea label="Segunda Definição" {...register("secondDefinition")} error={errors.secondDefinition?.message} rows={2} />
          <Textarea label="Terceira Definição" {...register("thirdDefinition")} error={errors.thirdDefinition?.message} rows={2} />
        </div>
        <Textarea label="Exemplo de Uso" {...register("usageExample")} error={errors.usageExample?.message} rows={2} />
      </FormSection>

      <FormSection title="Multimédia" icon="Image">
        <input type="hidden" {...register("audioUrl")} />
        <input type="hidden" {...register("imageUrl")} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <MediaUploadField
            label="Áudio"
            kind="audio"
            accept="audio/*"
            value={audioUrl}
            isLoading={isUploadingMedia}
            disabled={isPending}
            error={errors.audioUrl?.message}
            onFileSelect={(file) => handleMediaUpload("audioUrl", file)}
            onClear={() => setValue("audioUrl", "", { shouldDirty: true, shouldValidate: true })}
          />
          <MediaUploadField
            label="Imagem"
            kind="image"
            accept="image/*"
            value={imageUrl}
            isLoading={isUploadingMedia}
            disabled={isPending}
            error={errors.imageUrl?.message}
            onFileSelect={(file) => handleMediaUpload("imageUrl", file)}
            onClear={() => setValue("imageUrl", "", { shouldDirty: true, shouldValidate: true })}
          />
        </div>
        <Input label="URL do Vídeo" startIcon="Video" {...register("videoUrl")} error={errors.videoUrl?.message} />
      </FormSection>

      <FormSection title="Formas Curtas e Siglas" icon="Minimize2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Abreviatura" startIcon="Type" {...register("abbreviation")} error={errors.abbreviation?.message} />
          <Input label="Sigla" startIcon="Hash" {...register("acronym")} error={errors.acronym?.message} />
          <Input label="Significado da Sigla" startIcon="BadgeQuestionMark" {...register("acronymMeaning")} error={errors.acronymMeaning?.message} />
          <Input label="Redução" startIcon="Minimize2" {...register("reduction")} error={errors.reduction?.message} />
          <Input label="Significado da Redução" startIcon="Minimize2" {...register("reductionMeaning")} error={errors.reductionMeaning?.message} />
          <Input label="Forma Curta" startIcon="ChevronRight" {...register("shortForm")} error={errors.shortForm?.message} />
          <Input label="Forma Completa" startIcon="ChevronLeft" {...register("fullForm")} error={errors.fullForm?.message} />
        </div>
      </FormSection>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-3 p-4 bg-muted/40 rounded-xl border border-border/50">
        {[
          ["isVocabulary", "É VONALP?"],
          ["isVocabularyEP", "É VONALP-EP?"],
          ["isForeignism", "Estrangeirismo"],
        ].map(([name, label]) => (
          <div key={name} className="flex items-center justify-between space-x-4">
            <span className="text-sm font-semibold">{label}</span>
            <Controller
              control={control}
              name={name as "isVocabulary" | "isVocabularyEP" | "isForeignism"}
              render={({ field: { value, onChange } }) => (
                <Switch checked={value} onCheckedChange={onChange} />
              )}
            />
          </div>
        ))}
      </section>

      <ButtonSubmit form="neologism-form" className="hidden" />
    </form>
  );
}
