import type { ReactNode } from "react";
import { AuthGate } from "@/components/auth/AuthGate";
import { NavBar } from "@/components/app/NavBar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <div className="flex min-h-dvh">
        <NavBar />
        {/* pb-24 no mobile deixa espaço para a barra inferior fixa */}
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 md:pb-10 lg:px-10">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </AuthGate>
  );
}
