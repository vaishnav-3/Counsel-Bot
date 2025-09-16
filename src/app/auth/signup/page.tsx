import { SignupForm } from "@/app/auth/_components/signup-form";
import Image from "next/image";
import { BotMessageSquare } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <BotMessageSquare className="size-5" />
            </div>
            <p className="text-zinc-700 dark:text-white">Counsel Bot</p>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block"
      style={{ background: "oklch(0.9818 0.0054 95.0986)" }}
        >
          <Image
            src="/landing-page.svg"
            alt="Image"
            fill
            className="absolute inset-0 h-full w-full object-cover"
          />
      </div>
    </div>
  );
}
