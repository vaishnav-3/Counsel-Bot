"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { HeaderBreadcrumb } from "@/components/header-breadcrumb"

export function ChatHeaderBar() {
  return (
    <div
      className="
        sticky top-0 z-30
        bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60
        border-b border-border
      "
      role="banner"
      aria-label="Chat header"
    >
      <div className="flex h-12 items-center gap-2 px-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <HeaderBreadcrumb />
      </div>
    </div>
  )
}
