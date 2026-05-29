"use client";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores";
import { EntryFormData, entrySchema } from "@/schemas";
import { useAddEntry, useUpdateEntry, useUploadMedia } from "@/hooks";
import { 
  Button, 
  Input, 
  Textarea, 
  ButtonSubmit, 
  Switch, 
  MediaUploadField, 
  SelectField,
  FormSection 
} from "@/components";
import { grammatical_category, grammatical_status } from "@/constants/entries";
import { useWatch } from "react-hook-form";

interface EntryFormContentProps {
  action: "add" | "edit";
  currentEntry?: any;
}

export function EntryFormContent({ action, currentEntry }: EntryFormContentProps) {
  const { closeModal } = useModal();
  const { mutateAsync: addEntry, isPending: isAdding } = useAddEntry();
  const { mutateAsync: updateEntry, isPending: isUpdating } = useUpdateEntry();
  const { mutateAsync: uploadMedia, isPending: isUploadingMedia } = useUploadMedia();
  const isPending = isAdding || isUpdating || isUploadingMedia;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<EntryFormData>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      isVocabulary: true,
      isVocabularyEP: false,
      isForeignism: false,
    }
  });

  const selectedCategoryValue = useWatch({
    control,
    name: "grammaticalCategory",
  });
  const audioUrl = useWatch({ control, name: "audioUrl" });
  const imageUrl = useWatch({ control, name: "imageUrl" });

  const selectedCategory = grammatical_category.find(
    (c) => c.value === selectedCategoryValue
  );

  const subcategoryOptions = selectedCategory?.subcategories || [];

  useEffect(() => {
    if (action === "edit" && currentEntry) {
      reset(currentEntry);
    } else {
      reset({
        isVocabulary: true,
        isVocabularyEP: false,
        isForeignism: false,
      });
    }
  }, [action, currentEntry, reset]);

  async function onSubmit(data: EntryFormData) {
    try {
      if (action === "add") {
        await addEntry(data);
      } else if (currentEntry) {
        await updateEntry({ id: currentEntry.id, data });
      }
      closeModal(action === "add" ? "ADD_MODAL" : "EDIT_MODAL");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Ocorreu um erro ao guardar");
    }
  }

  const handleMediaUpload = async (field: "audioUrl" | "imageUrl", file: File) => {
    try {
      const media = await uploadMedia({
        file,
        entity: "entries",
        entityId: currentEntry?.id,
      });
      setValue(field, media.url, { shouldDirty: true, shouldValidate: true });
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Ocorreu um erro ao carregar a multimédia");
    }
  };

  const handleCancel = () => {
    closeModal(action === "add" ? "ADD_MODAL" : "EDIT_MODAL");
  };

  return (
    <form id="entry-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-4 px-1 max-h-[70vh] scrollbar-thin">
      <FormSection title="Informação Geral" icon="BookOpen">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Entrada (Palavra/Termo)"
            startIcon="BookOpen"
            {...register("entry")}
            error={errors.entry?.message}
            placeholder="Ex: Cardiologia"
          />
          <Input
            label="Código da Língua"
            startIcon="Languages"
            {...register("languageCode")}
            error={errors.languageCode?.message}
            placeholder="Ex: pt-BR"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Pronúncia"
            startIcon="Mic"
            {...register("pronunciation")}
            error={errors.pronunciation?.message}
            placeholder="Ex: /kaɾ.djo.lo.ˈʒi.ɐ/"
          />
          <Input
            label="Divisão Silábica"
            startIcon="Scissors"
            {...register("syllabicDivision")}
            error={errors.syllabicDivision?.message}
            placeholder="Ex: car-di-o-lo-gi-a"
          />
        </div>
        <Input
          label="Etimologia"
          startIcon="History"
          {...register("etymology")}
          error={errors.etymology?.message}
          placeholder="Ex: Do grego kardía (coração) + lógos (estudo)"
        />
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
        <Textarea
          label="Primeira Definição (Principal)"
          {...register("firstDefinition")}
          error={errors.firstDefinition?.message}
          placeholder="Definição obrigatória..."
          rows={3}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Textarea
            label="Segunda Definição (Opcional)"
            {...register("secondDefinition")}
            error={errors.secondDefinition?.message}
            placeholder="Outra acepção..."
            rows={2}
          />
          <Textarea
            label="Terceira Definição (Opcional)"
            {...register("thirdDefinition")}
            error={errors.thirdDefinition?.message}
            placeholder="Outra acepção..."
            rows={2}
          />
        </div>
        <Textarea
          label="Exemplo de Uso"
          {...register("usageExample")}
          error={errors.usageExample?.message}
          placeholder="Ex: A cardiologia avançou muito nos últimos anos."
          rows={2}
        />
      </FormSection>

      <FormSection title="Multimédia (Opcional)" icon="Image">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input type="hidden" {...register("audioUrl")} />
          <input type="hidden" {...register("imageUrl")} />
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
        <div className="grid grid-cols-1 gap-4">
          <Input
            label="URL do Vídeo"
            startIcon="Video"
            {...register("videoUrl")}
            error={errors.videoUrl?.message}
            placeholder="Ex: https://..."
          />
        </div>
      </FormSection>

      <FormSection title="Formas Curtas e Siglas" icon="Minimize2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Abreviatura"
            startIcon="Type"
            {...register("abbreviation")}
            error={errors.abbreviation?.message}
          />
          <Input
            label="Sigla"
            startIcon="Hash"
            {...register("acronym")}
            error={errors.acronym?.message}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Significado da Sigla"
            startIcon="BadgeQuestionMark"
            {...register("acronymMeaning")}
            error={errors.acronymMeaning?.message}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input
              label="Redução"
              startIcon="Minimize2"
              {...register("reduction")}
              error={errors.reduction?.message}
            />
            <Input
              label="Sig. da Redução"
              startIcon="Minimize2"
              {...register("reductionMeaning")}
              error={errors.reductionMeaning?.message}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Forma Curta"
            startIcon="ChevronRight"
            {...register("shortForm")}
            error={errors.shortForm?.message}
          />
          <Input
            label="Forma Longa"
            startIcon="ChevronLeft"
            {...register("fullForm")}
            error={errors.fullForm?.message}
          />
        </div>
      </FormSection>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 p-4 bg-muted/40 rounded-xl border border-border/50">
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
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-0.5">
            <span className="text-sm font-semibold">Estrangeirismo</span>
            <span className="text-xs text-muted-foreground leading-tight">O termo é de origem estrangeira?</span>
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
