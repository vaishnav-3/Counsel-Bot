"use client";

import * as React from "react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Role = "assistant" | "user";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  isLoading?: boolean;
}

interface ChatViewProps {
  sessionId: string;
  initialMessages?: ChatMessage[];
}

export function ChatView({ sessionId, initialMessages = [] }: ChatViewProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const { status } = useSession();
  const router = useRouter()
  const utils = api.useUtils();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  // Pending messages not yet confirmed from backend
  const [pendingMessages, setPendingMessages] = React.useState<ChatMessage[]>([]);

  // Fetch messages from backend
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = api.chat.getMessages.useQuery({ sessionId }, { enabled: !!sessionId, refetchOnWindowFocus: false, refetchOnReconnect: false });

  // Send message mutation
  const sendMessage = api.chat.sendMessage.useMutation({
    onSuccess: async () => {
      // Wait for the query to refetch before clearing pending messages
      await utils.chat.getMessages.invalidate({ sessionId });
      setPendingMessages([]);
      
      void utils.session.getSessions.invalidate();
    },
    onError: (error) => {
      console.error("Failed to send message:", error);
      setPendingMessages([]); // clear if error
    },
  });

  // Convert backend messages to ChatMessage format
  const messages: ChatMessage[] = React.useMemo(() => {
    if (!messagesData?.messages) return initialMessages;
    return messagesData.messages.map((msg) => ({
      id: msg.id,
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content,
    }));
  }, [messagesData?.messages, initialMessages]);

  // Combine confirmed and pending messages, but avoid duplicates
  const allMessages: ChatMessage[] = React.useMemo(() => {
    const combined = [...messages];
    
    // Only show pending messages that aren't already in confirmed messages
    pendingMessages.forEach(pendingMsg => {
      // For user messages, check if content already exists (avoid duplicates)
      if (pendingMsg.role === "user") {
        const isDuplicate = messages.some(msg => 
          msg.role === "user" && 
          msg.content === pendingMsg.content
        );
        if (!isDuplicate) {
          combined.push(pendingMsg);
        }
      } 
      // For AI loading messages, only show if there's no recent AI response
      else if (pendingMsg.isLoading) {
        combined.push(pendingMsg);
      }
    });
    
    return combined;
  }, [messages, pendingMessages]);

  // Scroll to bottom on new messages
  function scrollToBottom() {
    const el = viewportRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  React.useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  // Handle sending message
  async function handleSend(text: string) {
    if (!text.trim() || sendMessage.isPending) return;

    const userMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: text.trim(),
    };

    const aiThinkingMessage: ChatMessage = {
      id: `temp-ai-${Date.now()}`,
      role: "assistant",
      content: "",
      isLoading: true,
    };

    // Optimistically add user + AI placeholder
    setPendingMessages([userMessage, aiThinkingMessage]);

    try {
      await sendMessage.mutateAsync({
        sessionId,
        message: text.trim(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setPendingMessages([]); // clear on error
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Messages */}
      <main className="flex-1 flex flex-col">
        <div
          ref={viewportRef}
          className={cn(
            "mx-auto w-full max-w-4xl px-4 py-5 pb-32 flex-1",
            allMessages.length === 0 ? "flex" : ""
          )}
          role="log"
          aria-live="polite"
        >
          {isLoadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading messages...
              </div>
            </div>
          ) : messagesError ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-sm text-destructive">
                Failed to load messages. Please try again.
              </div>
            </div>
          ) : allMessages.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center text-sm text-muted-foreground">
                Start a conversation. Your messages will appear here.
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {allMessages.map((m) => (
                <MessageBubble
                  key={m.id}
                  role={m.role}
                  content={m.content}
                  isLoading={m.isLoading}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Composer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 px-4 pb-4 pt-2 border-t backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-4xl">
          <ChatInput
            onSend={handleSend}
            disabled={sendMessage.isPending}
            placeholder={
              sendMessage.isPending
                ? "AI is responding..."
                : "Send a message..."
            }
          />
        </div>
      </footer>
    </div>
  );
}