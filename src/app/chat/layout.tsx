import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatProvider } from "@/components/chat-context";
import { ChatHeaderBar } from "@/components/chat/chat-header";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header */}

          <ChatHeaderBar />
          {/* <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 fixed bg-white">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <HeaderBreadcrumb />
            </div>
          </header> */}

          {/* Main content (chat UI will go here later)*/}
          <main className="flex-1 overflow-hidden">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ChatProvider>
  );
}
