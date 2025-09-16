"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { HeaderBreadcrumb } from "@/components/layout/header-breadcrumb";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../provider/ThemeProvider";

export function ChatHeaderBar() {
  const { darkMode, toggleDarkMode } = useTheme();

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
      <div className="flex h-12 items-center gap-2 px-3 w-full">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 font-bold"
        />
        <HeaderBreadcrumb />

        {/* Spacer to push toggle to the right */}
        <div className="flex-1" />

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-yellow-500" />
          ) : (
            <Moon className="h-5 w-5 text-gray-800 dark:text-gray-200" />
          )}
        </button>
      </div>
    </div>
  );
}
