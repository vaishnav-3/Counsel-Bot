import {ChatView} from "@/components/chat/chat-view";

interface ChatSessionPageProps {
  params: Promise<{ sessionId: string }>; // mark params as Promise
}

export default async function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = await params; //await it here

  return (
    <div className="h-full">
      {/* The surrounding app layout provides the sidebar and page shell */}
      <ChatView sessionId={sessionId} />
    </div>
  );
}

