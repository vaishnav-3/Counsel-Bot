

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { api } from "@/trpc/react";

// Format date utility
function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatSessionsPage() {
  const { data: sessions, isLoading } = api.session.getSessions.useQuery();
  const createSession = api.session.createSession.useMutation();

  const handleNewChat = async () => {
    const result = await createSession.mutateAsync({});
    window.location.assign(`/chat/${result.session.id}`);
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading sessions...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Chat Sessions</h1>
        <Button onClick={handleNewChat} className="font-medium">
          Start New Chat
        </Button>
      </div>

      <div className="space-y-3">
        {sessions?.sessions?.map((session) => (
          <Link key={session.id} href={`/chat/${session.id}`}>
            <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  {session.title}
                </CardTitle>
                <CardDescription>
                  Created {formatDate(session.createdAt)}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
