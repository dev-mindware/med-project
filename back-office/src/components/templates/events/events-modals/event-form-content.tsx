"use client";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores";
import { EventFormData, eventSchema } from "@/schemas";
import { useAddEvent, useUpdateEvent } from "@/hooks";
import { 
  Button, 
  Input, 
  Textarea, 
  ButtonSubmit, 
  SelectField,
  FormSection 
} from "@/components";

interface EventFormContentProps {
  action: "add" | "edit";
  currentEvent?: any;
}

const statusOptions = [
  { label: "Rascunho", value: "DRAFT" },
  { label: "Publicado", value: "PUBLISHED" },
  { label: "Cancelado", value: "CANCELLED" },
  { label: "Arquivado", value: "ARCHIVED" },
];

export function EventFormContent({ action, currentEvent }: EventFormContentProps) {
  const { closeModal } = useModal();
  const { mutateAsync: addEvent, isPending: isAdding } = useAddEvent();
  const { mutateAsync: updateEvent, isPending: isUpdating } = useUpdateEvent();
  const isPending = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      status: "DRAFT",
    }
  });

  const titleValue = watch("title");

  // Auto-generate slug from title
  useEffect(() => {
    if (action === "add" && titleValue) {
      const slug = titleValue
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
      setValue("slug", slug);
    }
  }, [titleValue, action, setValue]);

  useEffect(() => {
    if (action === "edit" && currentEvent) {
      // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
      const formatDateForInput = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      reset({
        ...currentEvent,
        startDate: formatDateForInput(currentEvent.startDate),
        endDate: formatDateForInput(currentEvent.endDate),
      });
    } else {
      reset({
        status: "DRAFT",
      });
    }
  }, [action, currentEvent, reset]);

  async function onSubmit(data: EventFormData) {
    try {
      const formattedData = {
        ...data,
        coverImageUrl: data.coverImageUrl?.trim() || undefined,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        maxRegistrations: data.maxRegistrations ? Number(data.maxRegistrations) : undefined,
      };

      if (action === "add") {
        await addEvent(formattedData as any);
      } else if (currentEvent) {
        await updateEvent({ id: currentEvent.id, data: formattedData as any });
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
    <form id="event-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-4 px-1 max-h-[70vh] overflow-y-auto scrollbar-thin">
      <FormSection title="Detalhes do Evento" icon="Calendar">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Título do Evento"
            startIcon="Calendar"
            {...register("title")}
            error={errors.title?.message}
            placeholder="Ex: Simpósio de Linguística..."
          />
          <Input
            label="Slug (URL)"
            startIcon="Link2"
            {...register("slug")}
            error={errors.slug?.message}
            placeholder="ex-evento-2024"
          />
        </div>
        <Textarea
          label="Descrição do Evento"
          {...register("description")}
          error={errors.description?.message}
          placeholder="Descreva os objetivos do evento..."
          rows={3}
        />
      </FormSection>

      <FormSection title="Logística e Datas" icon="MapPin">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Data de Início"
            type="datetime-local"
            {...register("startDate")}
            error={errors.startDate?.message}
          />
          <Input
            label="Data de Término"
            type="datetime-local"
            {...register("endDate")}
            error={errors.endDate?.message}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Localização"
            startIcon="MapPin"
            {...register("location")}
            error={errors.location?.message}
            placeholder="Ex: Auditório Central / Online"
          />
          <Input
            label="Capacidade Máxima"
            type="number"
            startIcon="Users"
            {...register("maxRegistrations", { valueAsNumber: true })}
            error={errors.maxRegistrations?.message}
            placeholder="Ex: 100"
          />
        </div>
      </FormSection>

      <FormSection title="Classificação" icon="Tag">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Categoria"
            startIcon="Tag"
            {...register("category")}
            error={errors.category?.message}
            placeholder="Ex: Conferência"
          />
          <Controller
            control={control}
            name="status"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Estado do Evento"
                value={value}
                options={statusOptions}
                onValueChange={onChange}
                error={errors.status?.message}
              />
            )}
          />
        </div>
        <Input
          label="URL da Imagem de Capa"
          startIcon="Image"
          {...register("coverImageUrl")}
          error={errors.coverImageUrl?.message}
          placeholder="https://..."
        />
      </FormSection>
    </form>
  );
}
