"use client"

import * as React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

export type MessageListProps = {
  messages: ChatMessage[]
}

function formatTimestamp(ts: string) {
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ts
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export default function MessageList({ messages }: MessageListProps) {
  const bottomRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col gap-4 p-4">
        {messages.map((m) => {
          const isUser = m.role === "user"
          return (
            <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[85%] flex-col md:max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
                <div
                  className={[
                    "px-4 py-2 whitespace-pre-wrap break-words text-sm sm:text-base",
                    "rounded-2xl",
                    isUser
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-muted text-foreground border border-border rounded-bl-sm",
                  ].join(" ")}
                >
                  {m.content}
                </div>
                <div
                  className={["mt-1 text-xs text-muted-foreground", isUser ? "text-right pr-1" : "text-left pl-1"].join(
                    " ",
                  )}
                >
                  {formatTimestamp(m.createdAt)}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
