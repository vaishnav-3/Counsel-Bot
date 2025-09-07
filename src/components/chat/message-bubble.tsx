import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, UserIcon, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Role = "assistant" | "user";

export interface MessageBubbleProps {
  role: Role;
  content: string;
  isLoading?: boolean; // new prop
}

export function MessageBubble({ role, content, isLoading }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="bg-muted text-foreground">
            <Bot className="size-4" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "prose prose-sm dark:prose-invert max-w-[min(80%,_48rem)] rounded-md px-4 py-3 text-[15px] leading-7",
          "prose-p:my-4 prose-li:my-2 prose-ul:my-4 prose-ol:my-4 prose-headings:my-5",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
        role="group"
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            AI is thinking...
          </div>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        )}
      </div>

      {isUser && (
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="bg-muted text-foreground">
            <UserIcon className="size-4" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
