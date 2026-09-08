"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { FullscreenLoader } from "@/components/ui/FullscreenLoader";

/**
 * Rotas só para visitantes (login, cadastro, recuperar-senha). Se já há sessão,
 * redireciona para o app.
 */
export function GuestGate({ children }: { children: ReactNode }) {
  const { firebaseUser, carregando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!carregando && firebaseUser) {
      router.replace("/dashboard");
    }
  }, [carregando, firebaseUser, router]);

  if (carregando || firebaseUser) {
    return <FullscreenLoader />;
  }

  return <>{children}</>;
}
