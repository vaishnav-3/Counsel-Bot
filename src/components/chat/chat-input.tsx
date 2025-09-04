"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function ChatInput({ onSend, disabled, placeholder = "Send a message...", className }: ChatInputProps) {
  const [value, setValue] = React.useState("")
  const ref = React.useRef<HTMLTextAreaElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue("")
    ref.current?.focus()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full rounded-lg border bg-background p-2 shadow-sm ", className)}
      aria-label="Chat composer"
    >
      <div className="flex items-end gap-2">
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={1}
          className="min-h-[44px] max-h-40 resize-none border-0 focus-visible:ring-0"
          aria-label="Message"
        />
        <Button type="submit" disabled={disabled || !value.trim()} className="h-9" aria-label="Send message">
          <Send className="mr-2 size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>
    </form>
  )
}
