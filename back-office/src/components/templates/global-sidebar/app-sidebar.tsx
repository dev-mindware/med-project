"use client";
import {
  NavMenu,
  UserInfo,
  Sidebar,
  SidebarRail,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarSkeleton,
  SidebarCompanyInfo,
} from "@/components";
import { menuItems } from "@/constants/menu-items";
import { useAuth } from "@/hooks/auth";

export function AppSidebar() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <SidebarSkeleton />;
  if (!user) return <SidebarSkeleton />;

  // Simple role-based filtering for now
  const filteredMenu = menuItems.items.filter(item => 
    !item.roles || item.roles.includes(user.role)
  ).map(item => ({
    ...item,
    items: item.items?.filter(sub => !sub.roles || sub.roles.includes(user.role))
  }));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarCompanyInfo />
      </SidebarHeader>
      <SidebarContent className="group-data-[collapsible=icon]:items-center mt-4">
        <NavMenu items={filteredMenu} />
      </SidebarContent>
      <SidebarFooter>
        <UserInfo />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
