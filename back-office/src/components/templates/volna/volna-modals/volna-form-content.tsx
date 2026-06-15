"use client";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ButtonSubmit, FormSection, Input, SelectField, Textarea } from "@/components";
import { grammatical_category } from "@/constants";
import { useAddVolnaTerm, useUpdateVolnaTerm } from "@/hooks";
import { VolnaFormData, volnaSchema } from "@/schemas";
import { useModal } from "@/stores";
import { ErrorMessage } from "@/utils/messages";
import { angolanNationalLanguages } from "../common/angolan-languages";

type VolnaFormContentProps = {
  action: "add" | "edit";
  currentVolnaTerm?: any;
};

export function VolnaFormContent({ action, currentVolnaTerm }: VolnaFormContentProps) {
  const { closeModal } = useModal();
  const { mutateAsync: addVolnaTerm } = useAddVolnaTerm();
  const { mutateAsync: updateVolnaTerm } = useUpdateVolnaTerm();
  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<VolnaFormData>({
    resolver: zodResolver(volnaSchema),
  });

  const selectedCategoryValue = useWatch({ control, name: "grammaticalCategory" });
  const selectedCategory = grammatical_category.find((category) => category.value === selectedCategoryValue);

  useEffect(() => {
    if (action === "edit" && currentVolnaTerm) {
      reset(currentVolnaTerm);
      return;
    }
    reset({});
  }, [action, currentVolnaTerm, reset]);

  async function onSubmit(data: VolnaFormData) {
    try {
      if (action === "add") {
        await addVolnaTerm(data);
      } else if (currentVolnaTerm) {
        await updateVolnaTerm({ id: currentVolnaTerm.id, data });
      }
      closeModal(action === "add" ? "VOLNA_ADD_MODAL" : "VOLNA_EDIT_MODAL");
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Ocorreu um erro ao guardar");
    }
  }

  return (
    <form id="volna-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-4 px-1 max-h-[70vh] scrollbar-thin">
      <FormSection title="Identificação" icon="Languages">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Vocábulo" startIcon="BookOpen" {...register("term")} error={errors.term?.message} placeholder="Ex: vocábulo em língua nacional" />
          <Controller
            control={control}
            name="language"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Língua nacional"
                value={value}
                options={angolanNationalLanguages}
                onValueChange={onChange}
                error={errors.language?.message}
                placeholder="Seleccione a língua"
              />
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Classificação gramatical" icon="Tags">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="grammaticalCategory"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Classe gramatical"
                value={value}
                options={grammatical_category}
                onValueChange={(nextValue) => {
                  onChange(nextValue);
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
                label="Subclasse gramatical"
                value={value}
                options={selectedCategory?.subcategories || []}
                onValueChange={onChange}
                disabled={!selectedCategoryValue || !selectedCategory?.subcategories.length}
                placeholder={!selectedCategoryValue ? "Seleccione a classe" : "Seleccione"}
                error={errors.grammaticalSubcategory?.message}
              />
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Definição e uso" icon="FileText">
        <Textarea label="Definição" {...register("definition")} error={errors.definition?.message} rows={4} />
        <Textarea label="Exemplo de uso" {...register("usageExample")} error={errors.usageExample?.message} rows={3} />
        <Textarea label="Notas" {...register("notes")} error={errors.notes?.message} rows={3} />
      </FormSection>

      <ButtonSubmit form="volna-form" className="hidden" />
    </form>
  );
}
