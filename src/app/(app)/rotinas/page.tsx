"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, ListChecks } from "lucide-react";

import { useApiQuery } from "@/hooks/useApi";
import type { RotinaResumo } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorRetry } from "@/components/ui/ErrorRetry";
import { FullscreenLoader } from "@/components/ui/FullscreenLoader";
import { ProgressBar } from "@/components/ui/ProgressBar";

export default function RotinasPage() {
  const { data, error, carregando, recarregar } =
    useApiQuery<RotinaResumo[]>("/api/rotinas");

  if (carregando && !data) {
    return <FullscreenLoader label="Carregando suas rotinas…" />;
  }
  if (error || !data) {
    return (
      <ErrorRetry
        mensagem="Não foi possível carregar suas rotinas."
        onRetry={recarregar}
      />
    );
  }

  return (
    <div className="animate-entrance space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            Rotinas
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Seus planos de estudo criados com a IA.
          </p>
        </div>
        {data.length > 0 && (
          <Button href="/chat" variant="outline" size="sm">
            <Sparkles size={16} />
            Nova rotina
          </Button>
        )}
      </header>

      {data.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <ListChecks size={28} className="text-indigo-400" aria-hidden />
          <div>
            <p className="font-medium text-white">Nenhuma rotina ainda</p>
            <p className="mt-1 text-sm text-slate-400">
              Converse com a IA para montar seu primeiro plano de estudos.
            </p>
          </div>
          <Button href="/chat">
            Criar rotina com IA
            <ArrowRight size={16} />
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((r) => (
            <Link key={r.id} href={`/rotinas/${r.id}`} className="block">
              <Card className="h-full p-5 transition-colors hover:border-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading font-bold text-white">{r.tema}</h2>
                  <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                    {r._count.tarefas} tarefa
                    {r._count.tarefas === 1 ? "" : "s"}
                  </span>
                </div>
                {r.descricao && (
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                    {r.descricao}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar
                    progress={r.progresso}
                    color={r.progresso === 100 ? "success" : "brand"}
                    height="sm"
                    className="flex-1"
                  />
                  <span className="text-xs font-medium text-slate-400">
                    {Math.round(r.progresso)}%
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
