import { Suspense } from "react";
import { ListPageSkeleton, PageWrapper } from "@/components/common";
import { BlogPostsList } from "@/components/templates/blog-posts/blog-posts-list";
import { BlogPostModal } from "@/components/templates/blog-posts/blog-posts-modals";

export default function BlogPostsPage() {
  return (
    <PageWrapper
      subRoute="Blog"
      showSeparator={true}
      routePath="/content-management/blog-posts"
      routeLabel="Gestão de Conteúdo"
    >
      <Suspense fallback={<ListPageSkeleton cols={6} />}>
        <BlogPostsList />
      </Suspense>
      <BlogPostModal action="add" />
    </PageWrapper>
  );
}
