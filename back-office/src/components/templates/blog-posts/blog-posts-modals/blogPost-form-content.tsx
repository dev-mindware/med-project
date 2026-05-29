"use client";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@/utils/messages";
import { useModal } from "@/stores";
import { BlogPostFormData, blogPostSchema } from "@/schemas";
import { useAddBlogPost, useUpdateBlogPost } from "@/hooks";
import { 
  Button, 
  Input, 
  Textarea, 
  ButtonSubmit, 
  Switch, 
  SelectField,
  FormSection 
} from "@/components";

interface BlogPostFormContentProps {
  action: "add" | "edit";
  currentBlogPost?: any;
}

const typeOptions = [
  { label: "Artigo", value: "ARTICLE" },
  { label: "Vídeo", value: "VIDEO" },
  { label: "Imagem", value: "IMAGE" },
  { label: "Cobertura de Evento", value: "EVENT_COVERAGE" },
  { label: "Anúncio", value: "ANNOUNCEMENT" },
];

export function BlogPostFormContent({ action, currentBlogPost }: BlogPostFormContentProps) {
  const { closeModal } = useModal();
  const { mutateAsync: addBlogPost, isPending: isAdding } = useAddBlogPost();
  const { mutateAsync: updateBlogPost, isPending: isUpdating } = useUpdateBlogPost();
  const isPending = isAdding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      type: "ARTICLE",
      status: "DRAFT",
      isFeatured: false,
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
    if (action === "edit" && currentBlogPost) {
      reset({
        ...currentBlogPost,
        tags: currentBlogPost.tags?.join(", ") || "",
        galleryImageUrls: currentBlogPost.galleryImageUrls?.join(", ") || "",
      });
    } else {
      reset({
        type: "ARTICLE",
        isFeatured: false,
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImageUrl: "",
        videoUrl: "",
        galleryImageUrls: "",
        category: "",
        tags: "",
      });
    }
  }, [action, currentBlogPost, reset]);

  async function onSubmit(data: BlogPostFormData) {
    try {
      // Clean up tags and gallery URLs
      const formattedData = {
        ...data,
        coverImageUrl: data.coverImageUrl?.trim() || undefined,
        videoUrl: data.videoUrl?.trim() || undefined,
        tags: typeof data.tags === 'string' ? (data.tags as string).split(',').map(t => t.trim()).filter(Boolean) : data.tags,
        galleryImageUrls: typeof data.galleryImageUrls === 'string' ? (data.galleryImageUrls as string).split(',').map(u => u.trim()).filter(Boolean) : data.galleryImageUrls,
      };

      if (action === "add") {
        await addBlogPost(formattedData as any);
      } else if (currentBlogPost) {
        await updateBlogPost({ id: currentBlogPost.id, data: formattedData as any });
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
    <form id="blog-post-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-4 px-1 max-h-[70vh] overflow-y-auto scrollbar-thin">
      <FormSection title="Conteúdo do Post" icon="FileText">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Título do Post"
            startIcon="Type"
            {...register("title")}
            error={errors.title?.message}
            placeholder="Ex: Lançamento do Dicionário..."
          />
          <Input
            label="Slug (URL)"
            startIcon="Link2"
            {...register("slug")}
            error={errors.slug?.message}
            placeholder="ex-post-url"
          />
        </div>
        <Textarea
          label="Resumo (Excerpt)"
          {...register("excerpt")}
          error={errors.excerpt?.message}
          placeholder="Uma breve introdução..."
          rows={2}
        />
        <Textarea
          label="Conteúdo Completo"
          {...register("content")}
          error={errors.content?.message}
          placeholder="O corpo do seu artigo..."
          rows={6}
        />
      </FormSection>

      <FormSection title="Media e Categorias" icon="Image">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="URL da Imagem de Capa"
            startIcon="Image"
            {...register("coverImageUrl")}
            error={errors.coverImageUrl?.message}
            placeholder="https://..."
          />
          <Input
            label="URL do Vídeo (Opcional)"
            startIcon="Video"
            {...register("videoUrl")}
            error={errors.videoUrl?.message}
            placeholder="YouTube link..."
          />
        </div>
        <Textarea
          label="Galeria de Imagens (URLs separadas por vírgula)"
          {...register("galleryImageUrls" as any)}
          error={errors.galleryImageUrls?.message}
          placeholder="https://url1.com, https://url2.com..."
          rows={2}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="type"
            render={({ field: { value, onChange } }) => (
              <SelectField
                label="Tipo de Post"
                value={value}
                options={typeOptions}
                onValueChange={onChange}
              />
            )}
          />
          <Input
            label="Categoria"
            startIcon="Tag"
            {...register("category")}
            error={errors.category?.message}
            placeholder="Ex: Notícias"
          />
        </div>
        <Input
          label="Tags (separadas por vírgula)"
          startIcon="Tag"
          {...register("tags" as any)}
          error={errors.tags?.message}
          placeholder="cultura, medicina, angola..."
        />
      </FormSection>

      <section className="p-4 bg-muted/40 rounded-xl border border-border/50">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex flex-col space-y-0.5">
            <span className="text-sm font-semibold">Post em Destaque</span>
            <span className="text-xs text-muted-foreground">Mostrar este post no topo da página?</span>
          </div>
          <Controller
            control={control}
            name="isFeatured"
            render={({ field: { value, onChange } }) => (
              <Switch checked={value} onCheckedChange={onChange} />
            )}
          />
        </div>
      </section>
    </form>
  );
}
