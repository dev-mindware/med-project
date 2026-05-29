"use client";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui";
import { Icon } from "@/components";

export function SidebarCompanyInfo() {
  return (
    <SidebarMenu className="group-data-[collapsible=icon]:items-center">
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          <div className="flex items-center justify-center rounded-lg bg-primary text-primary-foreground aspect-square size-8">
            <Icon name="Activity" className="size-4" />
          </div>
          <div className="grid flex-1 text-sm leading-tight text-left">
            <span className="font-semibold truncate">CN-IILP</span>
            <span className="text-xs truncate text-muted-foreground">Portal Linguístico</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
