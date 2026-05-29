import { Suspense } from "react";
import { PageWrapper } from "@/components/common";
import { UsersPageContent } from "@/components/templates/users";

export default function UsersPage() {
  return (
    <PageWrapper
      subRoute="Utilizadores"
      showSeparator={true}
      routePath="/administration/users"
      routeLabel="Administração"
    >
      <UsersPageContent />
    </PageWrapper>
  );
}
