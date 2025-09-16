"use client";


import { usePathname } from "next/navigation";
import { api } from "@/trpc/react";

export function HeaderBreadcrumb() {
  const { data: sessions } = api.session.getSessions.useQuery();
  const pathname = usePathname();
  const currentId = pathname?.match(/\/chat\/([^/]+)/)?.[1];
  const current = sessions?.sessions.find(s => s.id === currentId);

  return (
    <div className="font-bold">
            {current?.title || "New chat"}
    </div>
  );
}