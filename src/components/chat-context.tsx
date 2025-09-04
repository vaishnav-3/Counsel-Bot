"use client"

import * as React from "react"

type ChatContextValue = {
  selectedChatName: string
  setSelectedChatName: (name: string) => void
}

const ChatContext = React.createContext<ChatContextValue | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [selectedChatName, setSelectedChatName] = React.useState<string>("New chat")

  const value = React.useMemo(() => ({ selectedChatName, setSelectedChatName }), [selectedChatName])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const ctx = React.useContext(ChatContext)
  if (!ctx) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return ctx
}
