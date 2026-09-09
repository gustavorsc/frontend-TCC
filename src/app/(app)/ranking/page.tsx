"use client";

import { Trophy, Medal } from "lucide-react";

import { useApiQuery } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import type { RankingEntrada } from "@/types";
import { Card } from "@/components/ui/Card";
import { ErrorRetry } from "@/components/ui/ErrorRetry";
import { FullscreenLoader } from "@/components/ui/FullscreenLoader";

const CORES_PODIO = ["text-amber-400", "text-slate-300", "text-amber-700"];

export default function RankingPage() {
  const { usuario } = useAuth();
  const { data, error, carregando, recarregar } =
    useApiQuery<RankingEntrada[]>("/api/ranking");

  if (carregando && !data) {
    return <FullscreenLoader label="Carregando o ranking…" />;
  }
  if (error || !data) {
    return (
      <ErrorRetry
        mensagem="Não foi possível carregar o ranking."
        onRetry={recarregar}
      />
    );
  }

  const euNoRanking = usuario
    ? data.some((e) => e.usuarioId === usuario.id)
    : false;

  return (
    <div className="animate-entrance space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Ranking semanal
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          XP ganho nesta semana. Reinicia toda segunda-feira.
        </p>
      </header>

      {data.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <Trophy size={28} className="text-slate-500" aria-hidden />
          <p className="text-sm text-slate-400">
            Ninguém pontuou nesta semana ainda. Conclua uma tarefa para abrir o
            placar.
          </p>
        </Card>
      ) : (
        <>
          <ol className="space-y-2">
            {data.map((entrada, i) => {
              const eu = usuario?.id === entrada.usuarioId;
              return (
                <li key={entrada.usuarioId}>
                  <Card
                    className={`flex items-center gap-4 p-4 ${
                      eu ? "border-indigo-500/40 bg-indigo-500/5" : ""
                    }`}
                  >
                    <div className="flex w-8 shrink-0 justify-center">
                      {i < 3 ? (
                        <Medal
                          size={20}
                          className={CORES_PODIO[i]}
                          aria-hidden
                        />
                      ) : (
                        <span className="text-sm font-bold text-slate-500">
                          {i + 1}
                        </span>
                      )}
                    </div>
                    <span className="min-w-0 flex-1 truncate font-medium text-white">
                      {entrada.nome}
                      {eu && (
                        <span className="ml-2 text-xs font-normal text-indigo-400">
                          você
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-sm font-bold text-indigo-300">
                      {entrada.xpSemana} XP
                    </span>
                  </Card>
                </li>
              );
            })}
          </ol>

          {!euNoRanking && (
            <p className="text-center text-sm text-slate-500">
              Você ainda não pontuou nesta semana — conclua uma tarefa para
              entrar no ranking.
            </p>
          )}
        </>
      )}
    </div>
  );
}
