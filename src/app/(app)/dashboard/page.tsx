"use client";

import Link from "next/link";
import { Flame, Sparkles, Star, ListChecks, Target, ArrowRight } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useApiQuery } from "@/hooks/useApi";
import type { Progresso, Desafio } from "@/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorRetry } from "@/components/ui/ErrorRetry";
import { FullscreenLoader } from "@/components/ui/FullscreenLoader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";

function primeiroNome(nome: string | null) {
  return (nome ?? "").split("@")[0].split(" ")[0] || "Estudante";
}

/** Primeira linha do `conteudo` do desafio é o título (gerado pela IA). */
function tituloDesafio(conteudo: string) {
  return conteudo.split("\n")[0].trim();
}

export default function DashboardPage() {
  const { nomeExibicao } = useAuth();
  const progresso = useApiQuery<Progresso>("/api/usuarios/me/progresso");
  const desafios = useApiQuery<Desafio[]>("/api/desafios");

  if (progresso.carregando && !progresso.data) {
    return <FullscreenLoader label="Carregando seu progresso…" />;
  }

  if (progresso.error || !progresso.data) {
    return (
      <ErrorRetry
        mensagem="Não foi possível carregar seu progresso."
        onRetry={progresso.recarregar}
      />
    );
  }

  const { xpTotal, streakAtual, streakEmRisco, rotinas } = progresso.data;
  const desafiosAbertos = (desafios.data ?? []).filter((d) => !d.concluido);

  return (
    <div className="animate-entrance space-y-8">
      <header>
        <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Olá, {primeiroNome(nomeExibicao)} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Aqui está o resumo dos seus estudos.
        </p>
      </header>

      {streakEmRisco && (
        <Alert tone="info">
          Sua ofensiva de <strong>{streakAtual} dia{streakAtual === 1 ? "" : "s"}</strong>{" "}
          está em risco — conclua uma tarefa hoje para não perder o progresso.
        </Alert>
      )}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={Star} label="XP total" value={xpTotal} />
        <StatCard
          icon={Flame}
          label="Ofensiva"
          accent="text-amber-400"
          value={`${streakAtual} dia${streakAtual === 1 ? "" : "s"}`}
        />
        <StatCard
          icon={ListChecks}
          label="Rotinas"
          accent="text-emerald-400"
          value={rotinas.length}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-white">
            Suas rotinas
          </h2>
          {rotinas.length > 0 && (
            <Link
              href="/rotinas"
              className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Ver todas
            </Link>
          )}
        </div>

        {rotinas.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 p-8 text-center">
            <Sparkles size={28} className="text-indigo-400" aria-hidden />
            <div>
              <p className="font-medium text-white">
                Você ainda não tem uma rotina
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Converse com a IA e monte um plano de estudos sob medida.
              </p>
            </div>
            <Button href="/chat">
              Criar rotina com IA
              <ArrowRight size={16} />
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {rotinas.map((r) => (
              <Link key={r.id} href={`/rotinas/${r.id}`} className="block">
                <Card className="p-4 transition-colors hover:border-slate-700">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="font-medium text-white">{r.tema}</span>
                    <span className="shrink-0 text-xs font-medium text-slate-400">
                      {r.progresso}%
                    </span>
                  </div>
                  <ProgressBar
                    progress={r.progresso}
                    color={r.progresso === 100 ? "success" : "brand"}
                    height="sm"
                  />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-white">Desafios</h2>

        {desafios.error ? (
          <ErrorRetry
            mensagem="Não foi possível carregar os desafios."
            onRetry={desafios.recarregar}
          />
        ) : desafiosAbertos.length === 0 ? (
          <Card className="p-6 text-center text-sm text-slate-400">
            Nenhum desafio no momento. Eles aparecem quando você acumula tarefas
            atrasadas de um mesmo tema.
          </Card>
        ) : (
          <div className="space-y-3">
            {desafiosAbertos.map((d) => (
              <Card key={d.id} className="flex items-start gap-3 p-4" glow="warning">
                <Target size={20} className="mt-0.5 shrink-0 text-amber-400" aria-hidden />
                <div>
                  <p className="font-medium text-white">{tituloDesafio(d.conteudo)}</p>
                  <p className="text-xs text-slate-500">Tema: {d.tema}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
