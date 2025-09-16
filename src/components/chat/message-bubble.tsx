import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, UserIcon, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Role = "assistant" | "user";

export interface MessageBubbleProps {
  role: Role;
  content: string;
  isLoading?: boolean;
}

export function MessageBubble({ role, content, isLoading }: MessageBubbleProps) {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex w-full items-start gap-3 my-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* Avatar for Assistant */}
      {!isUser && (
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="bg-zinc-700 text-amber-50 dark:text-black dark:bg-stone-300">
            <Bot className="size-4" />
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[min(80%,_48rem)] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm",
          isUser
            ? "bg-stone-200 text-black dark:bg-black dark:text-amber-50 border border-stone-300 dark:border-stone-700"
            : "bg-zinc-100 text-black dark:bg-zinc-800 dark:text-amber-50 border border-zinc-300 dark:border-zinc-700"
        )}
      >
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>AI is thinking...</span>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => (
                  <h1 className="text-3xl font-bold my-4 text-black dark:text-amber-50" {...props} />
                ),
                h2: ({node, ...props}) => (
                  <h2 className="text-2xl font-semibold my-3 text-black dark:text-amber-50" {...props} />
                ),
                h3: ({node, ...props}) => (
                  <h3 className="text-xl font-semibold my-2 text-black dark:text-amber-50" {...props} />
                ),
                p: ({node, ...props}) => (
                  <p className="mb-3 text-[15px] leading-relaxed text-black dark:text-amber-50" {...props} />
                ),
                ul: ({node, ...props}) => (
                  <ul className="ml-5 list-disc mb-3 text-black dark:text-amber-50" {...props} />
                ),
                ol: ({node, ...props}) => (
                  <ol className="ml-5 list-decimal mb-3 text-black dark:text-amber-50" {...props} />
                ),
                li: ({node, ...props}) => (
                  <li className="mb-1" {...props} />
                ),
                strong: ({node, ...props}) => (
                  <strong className="font-semibold text-black dark:text-amber-50" {...props} />
                ),
                em: ({node, ...props}) => (
                  <em className="italic text-black dark:text-amber-50" {...props} />
                ),
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-l-2 border-gray-300 dark:border-gray-600 pl-4 italic my-3 text-gray-700 dark:text-gray-300" {...props} />
                ),
                a: ({node, ...props}) => (
                  <a className="text-blue-600 dark:text-blue-400 underline" {...props} />
                ),
              }}
            >
            {content}
          </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Avatar for User */}
      {isUser && (
        <Avatar className="size-9 shrink-0">
          <AvatarFallback className="bg-zinc-700 text-amber-50 dark:text-black dark:bg-stone-300">
            <UserIcon className="size-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
