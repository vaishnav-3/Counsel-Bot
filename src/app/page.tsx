import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust if needed

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    // logged in go to chat
    redirect("/chat");
  } else {
    // not logged in go to signin
    redirect("/auth/signin");
  }

  // (this will never render, because redirect() exits)
  return null;
}
