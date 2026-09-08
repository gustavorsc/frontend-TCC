import type { ReactNode } from "react";
import { GuestGate } from "@/components/auth/GuestGate";
import { Logo } from "@/components/brand/Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <GuestGate>
      <div className="relative flex min-h-dvh flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.14),transparent_60%)]" />
        <header className="relative z-10 p-5 sm:p-6">
          <Logo href="/" />
        </header>
        <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 pt-4">
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </GuestGate>
  );
}
