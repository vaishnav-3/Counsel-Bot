"use client";

import { Trash2, MessageSquare, Loader2 } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { api } from "@/trpc/react";
import { usePathname, useRouter } from "next/navigation"; // ⬅️ import router
import Link from "next/link";

type Chat = {
  id: string;
  title: string;
};

export function NavChats({
  chats,
  isLoading,
  onSelect,
}: {
  chats: Chat[];
  isLoading?: boolean;
  onSelect?: (id: string) => void;
}) {
  const { isMobile } = useSidebar();
  const utils = api.useUtils();
  const pathname = usePathname();
  const router = useRouter(); // ⬅️ add router

  // Extract current chatId from pathname (/chat/[id]) 
  const currentId = pathname?.match(/\/chat\/([^/]+)/)?.[1];

  const deleteSession = api.session.deleteSession.useMutation({
    onSuccess: (_, variables) => {
      utils.session.getSessions.invalidate();

      if (variables.sessionId === currentId) {
        router.push("/chat");
      }
    },
  });

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Chats</SidebarGroupLabel>
      <SidebarMenu>
        {isLoading ? (
          <SidebarMenuItem>
            <SidebarMenuButton className="flex items-center gap-2 opacity-70">
              <Loader2 className="animate-spin" />
              <span>Loading chats...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : chats.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton className="opacity-70">
              <span>No chats found</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          chats.map((chat) => {
            const isActive = currentId === chat.id;

            return (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                  asChild
                  onClick={onSelect ? () => onSelect(chat.id) : undefined}
                  className={`flex items-center gap-2 ${
                    isActive
                      ? "bg-stone-200 dark:bg-black text-gray-900 dark:text-white font-medium hover:bg-stone-200 "
                      : "hover:bg-stone-200 dark:hover:bg-black"
                  }`}
                >
                  <Link href={`/chat/${chat.id}`}>
                    <MessageSquare />
                    <span className="truncate">{chat.title}</span>
                  </Link>
                </SidebarMenuButton>

                <SidebarMenuAction
                  onClick={() => deleteSession.mutate({ sessionId: chat.id })}
                  aria-label={`Delete ${chat.title}`}
                  title="Delete chat"
                  className="hover:bg-red-300 dark:hover:bg-red-800"
                >
                  <Trash2 />
                  <span className="sr-only">Delete</span>
                </SidebarMenuAction>
              </SidebarMenuItem>
            );
          })
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}