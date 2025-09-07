"use client";

import type * as React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BotMessageSquare } from "lucide-react";

export function LogoSidebar() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="hover:bg-transparent focus:bg-transparent active:bg-transparent">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <BotMessageSquare />
          </div>
          <div className="group-data-[collapsible=icon]:hidden grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">Counsel Bot</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
