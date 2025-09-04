import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust import path if needed

export default async function ChatPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    //  Not logged in redirect to 
    redirect("/auth/signin");
  }

  // Authenticated render page
  return (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      <p>Select a chat or start a new one</p>
    </div>
  );
}