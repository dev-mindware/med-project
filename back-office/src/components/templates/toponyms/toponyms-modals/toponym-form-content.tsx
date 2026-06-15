"use client";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores";
import { ToponymFormData, toponymSchema } from "@/schemas";
import { useAddToponym, useUpdateToponym, useUploadMedia } from "@/hooks";
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
import { ao_provinces, common_usage, toponym_classes } from "@/constants/toponym";
import { useWatch } from "react-hook-form";

interface ToponymFormContentProps {
  action: "add" | "edit";
  currentToponym?: any;
}

export function ToponymFormContent({ action, currentToponym }: ToponymFormContentProps) {
  const { closeModal } = useModal();
  const { mutateAsync: addToponym, isPending: isAdding } = useAddToponym();
  const { mutateAsync: updateToponym, isPending: isUpdating } = useUpdateToponym();
  const { mutateAsync: uploadMedia, isPending: isUploadingMedia } = useUploadMedia();
  const isPending = isAdding || isUpdating || isUploadingMedia;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ToponymFormData>({
    resolver: zodResolver(toponymSchema),
    defaultValues: {
      isVocabulary: false,
      isVocabularyEP: false,
      isForeignism: false,
    }
  });

  const selectedProvinceValue = useWatch({
    control,
    name: "province",
  });

  const selectedClassValue = useWatch({
    control,
    name: "toponymClasses",
  });
  const locationImage = useWatch({ control, name: "locationImage" });

  const selectedProvince = ao_provinces.find(
    (p) => p.value === selectedProvinceValue
  );

  const municipalityOptions = selectedProvince?.municipalities || [];

  const selectedClass = toponym_classes.find(
    (c) => c.value === (Array.isArray(selectedClassValue) ? selectedClassValue[0] : selectedClassValue)
  );

  const subclassOptions = selectedClass?.subclasses || [];

  useEffect(() => {
    if (action === "edit" && currentToponym) {
      reset(currentToponym);
    } else {
      reset({
        isVocabulary: false,
        isVocabularyEP: false,
        isForeignism: false,
      });
    }
  }, [action, currentToponym, reset]);

  async function onSubmit(data: ToponymFormData) {
    try {
      if (action === "add") {
        await addToponym(data);
      } else if (currentToponym) {
        await updateToponym({ id: currentToponym.id, data });
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

  const handleLocationImageUpload = async (file: File) => {
    try {
      const media = await uploadMedia({
        file,
        entity: "toponyms",
        entityId: currentToponym?.id,
      });
      setValue("locationImage", media.url, { shouldDirty: true, shouldValidate: true });
    } catch (error: any) {
      ErrorMessage(error?.response?.data?.message || "Ocorreu um erro ao carregar a imagem");
    }
  };

  return (
    <form id="toponym-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-4 px-1 max-h-[70vh] scrollbar-thin">
      <FormSection title="Informação do Lugar" icon="MapPin">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Topónimo (Nome do Lugar)"
            startIcon="MapPin"
            {...register("toponym")}
            error={errors.toponym?.message}
            placeholder="Ex: Luanda"
          />
          <Input
            label="Gentílico"
            startIcon="Users"
            {...register("gentilic")}
            error={errors.gentilic?.message}
            placeholder="Ex: Luandense"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Controller
            control={control}
            name="province"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Província"
                value={value}
                options={ao_provinces}
                onValueChange={(val) => {
                  onChange(val);
                  setValue("municipality", ""); 
                }}
                error={errors.province?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="municipality"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Município"
                value={value}
                options={municipalityOptions}
                onValueChange={onChange}
                disabled={!selectedProvinceValue}
                placeholder={!selectedProvinceValue ? "Seleccione Província" : "Seleccione"}
                error={errors.municipality?.message}
              />
            )}
          />
          <Input
            label="Localização Específica"
            startIcon="Navigation"
            {...register("location")}
            error={errors.location?.message}
            placeholder="Ex: Zona urbana..."
          />
        </div>
      </FormSection>

      <FormSection title="Detalhes Linguísticos" icon="Languages">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Pronúncia"
            startIcon="Mic"
            {...register("pronunciation")}
            error={errors.pronunciation?.message}
          />
          <Input
            label="Variação Gráfica"
            startIcon="Type"
            {...register("graphicVariation")}
            error={errors.graphicVariation?.message}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="toponymClasses"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Classe do Topónimo"
                value={Array.isArray(value) ? value[0] : value}
                options={toponym_classes}
                onValueChange={(val) => {
                  onChange([val]);
                  setValue("toponymSubclasses", []);
                }}
                placeholder="Seleccione a classe"
              />
            )}
          />
          <Controller
            control={control}
            name="toponymSubclasses"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Subclasse"
                value={Array.isArray(value) ? value[0] : value}
                options={subclassOptions}
                onValueChange={(val) => onChange([val])}
                disabled={subclassOptions.length === 0}
                placeholder={subclassOptions.length === 0 ? "Seleccione a classe primeiro" : "Seleccione"}
              />
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Significado e Contexto" icon="History">
        <Textarea
          label="Significado"
          {...register("meaning")}
          error={errors.meaning?.message}
          placeholder="Origem e significado do nome..."
          rows={3}
        />
        <Textarea
          label="História do Topónimo"
          {...register("toponymHistory")}
          error={errors.toponymHistory?.message}
          placeholder="Contexto histórico..."
          rows={3}
        />
        <Textarea
          label="Proveniência"
          {...register("toponymProvenance")}
          error={errors.toponymProvenance?.message}
          placeholder="De onde veio o nome..."
          rows={2}
        />
      </FormSection>

      <FormSection title="Media e Uso" icon="Image">
        <input type="hidden" {...register("locationImage")} />
        <MediaUploadField
          label="Imagem da Localidade"
          kind="image"
          accept="image/*"
          value={locationImage}
          isLoading={isUploadingMedia}
          disabled={isPending}
          error={errors.locationImage?.message}
          onFileSelect={handleLocationImageUpload}
          onClear={() => setValue("locationImage", "", { shouldDirty: true, shouldValidate: true })}
        />
        <Controller
          control={control}
          name="commonUsage"
          render={({ field: { value, onChange } }) => (
            <SelectField
              label="Uso Comum"
              value={value}
              options={common_usage}
              onValueChange={onChange}
              error={errors.commonUsage?.message}
            />
          )}
        />
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
