"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { api } from "@/trpc/react";

export function HeaderBreadcrumb() {
  const { data: sessions } = api.session.getSessions.useQuery();
  const pathname = usePathname();
  const currentId = pathname?.match(/\/chat\/([^/]+)/)?.[1];
  const current = sessions?.sessions.find(s => s.id === currentId);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>
            {current?.title || "New chat"}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}