"use client";

import * as React from "react";
import { Bot, Plus } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";

import { NavUser } from "@/components/layout/nav-user";
import { NavChats } from "@/components/layout/nav-chats";
import { LogoSidebar } from "@/components/layout/logo-sidebar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarInput,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { api } from "@/trpc/react"; // Import your TRPC hooks
import { useRouter } from "next/navigation";
import { useChat } from "../provider/chat-context";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [search, setSearch] = React.useState("");
  const { setSelectedChatName } = useChat();
  const router = useRouter();

  //  Fetch sessions from DB
  const {
    data: sessions,
    isLoading,
    refetch,
  } = api.session.getSessions.useQuery();

  // Mutation for creating new session
  const createSession = api.session.createSession.useMutation({
    onSuccess: (data) => {
      // after creating, navigate to the new chat page
      router.push(`/chat/${data.session.id}`);
      setSelectedChatName(data.session.title);
      refetch(); // refresh sidebar sessions
    },
  });

  // Handler
  const handleNewChat = async () => {
    await createSession.mutateAsync({});
  };

  // Filtered chats
  const filteredChats = sessions?.sessions?.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TooltipProvider>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <LogoSidebar />

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleNewChat}
                tooltip="New Chat"
                className="justify-start"
              >
                <Plus className="shrink-0" />
                <span className="truncate group-data-[collapsible=icon]:hidden">
                  New Chat
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* Search */}
          <div className="px-2">
            <div className="relative group-data-[collapsible=icon]:hidden">
              <Bot
                aria-hidden="true"
                className="text-muted-foreground pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2"
              />
              <SidebarInput
                placeholder="Search chats..."
                aria-label="Search chats"
                id="sidebar-search-input"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
              />
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <NavChats
            chats={filteredChats || []}
            isLoading={isLoading}
            onSelect={(id: string) => {
              const found = filteredChats?.find((c) => c.id === id);
              if (found) {
                setSelectedChatName(found.title);
                router.push(`/chat/${found.id}`);
              }
            }}
          />
        </SidebarContent>

        <SidebarFooter>
          <NavUser />
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
