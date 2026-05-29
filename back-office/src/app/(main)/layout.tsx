import { AppSidebar, BreadcrumbProvider, RoleGuard } from "@/components";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

type Props = {
  children: React.ReactNode;
};

export default function ClientLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbProvider>
          <RoleGuard>
            {children}
          </RoleGuard>
        </BreadcrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
