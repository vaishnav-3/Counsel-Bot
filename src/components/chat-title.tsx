"use client"

import { useChat } from "./chat-context"

export function ChatTitle({ fallback = "New Chat" }: { fallback?: string }) {
  const { selectedChat } = useChat()
  return <span className="text-foreground text-pretty">{selectedChat?.title ?? fallback}</span>
}
