"use client";

import Link from "next/link";
import { useState } from "react";
import { Flame, Star, Target, Check, ChevronRight } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { useApiQuery } from "@/hooks/useApi";
import type { Progresso, Desafio } from "@/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorRetry } from "@/components/ui/ErrorRetry";
import { FullscreenLoader } from "@/components/ui/FullscreenLoader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";

export default function ProgressoPage() {
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

  return (
    <div className="animate-entrance space-y-8">
      <header>
        <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Progresso
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Seu XP, ofensiva e o andamento de cada rotina.
        </p>
      </header>

      {streakEmRisco && (
        <Alert tone="info">
          Sua ofensiva de{" "}
          <strong>
            {streakAtual} dia{streakAtual === 1 ? "" : "s"}
          </strong>{" "}
          está em risco — conclua uma tarefa hoje para mantê-la.
        </Alert>
      )}

      <section className="grid grid-cols-2 gap-4">
        <StatCard icon={Star} label="XP total" value={xpTotal} />
        <StatCard
          icon={Flame}
          label="Ofensiva"
          accent="text-amber-400"
          value={`${streakAtual} dia${streakAtual === 1 ? "" : "s"}`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-white">
          Progresso por rotina
        </h2>
        {rotinas.length === 0 ? (
          <Card className="p-6 text-center text-sm text-slate-400">
            Nenhuma rotina ainda.{" "}
            <Link href="/chat" className="font-medium text-indigo-400">
              Criar uma
            </Link>
            .
          </Card>
        ) : (
          <div className="space-y-3">
            {rotinas.map((r) => (
              <Link key={r.id} href={`/rotinas/${r.id}`} className="block">
                <Card className="flex items-center gap-4 p-4 transition-colors hover:border-slate-700">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="truncate font-medium text-white">
                        {r.tema}
                      </span>
                      <span className="shrink-0 text-xs font-medium text-slate-400">
                        {Math.round(r.progresso)}%
                      </span>
                    </div>
                    <ProgressBar
                      progress={r.progresso}
                      color={r.progresso === 100 ? "success" : "brand"}
                      height="sm"
                    />
                  </div>
                  <ChevronRight
                    size={18}
                    className="shrink-0 text-slate-600"
                    aria-hidden
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
        ) : (desafios.data ?? []).length === 0 ? (
          <Card className="p-6 text-center text-sm text-slate-400">
            Nenhum desafio ainda. Eles são gerados quando você acumula tarefas
            atrasadas de um mesmo tema.
          </Card>
        ) : (
          <div className="space-y-3">
            {(desafios.data ?? []).map((d) => (
              <DesafioCard
                key={d.id}
                desafio={d}
                aoConcluir={desafios.recarregar}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function DesafioCard({
  desafio,
  aoConcluir,
}: {
  desafio: Desafio;
  aoConcluir: () => void;
}) {
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [titulo, ...resto] = desafio.conteudo.split("\n");
  const corpo = resto.join("\n").trim();

  async function concluir() {
    setProcessando(true);
    setErro(null);
    try {
      await api(`/api/desafios/${desafio.id}/concluir`, { method: "PATCH" });
      aoConcluir();
    } catch (e) {
      setErro(
        e instanceof ApiError
          ? e.message
          : "Não foi possível concluir o desafio.",
      );
      setProcessando(false);
    }
  }

  return (
    <Card
      glow={desafio.concluido ? undefined : "warning"}
      className={`p-5 ${desafio.concluido ? "opacity-70" : ""}`}
    >
      <div className="flex items-start gap-3">
        <Target
          size={20}
          className={`mt-0.5 shrink-0 ${
            desafio.concluido ? "text-emerald-500" : "text-amber-400"
          }`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p
            className={`font-medium ${
              desafio.concluido ? "text-slate-400 line-through" : "text-white"
            }`}
          >
            {titulo.trim()}
          </p>
          <p className="text-xs text-slate-500">Tema: {desafio.tema}</p>
        </div>
      </div>

      {corpo && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
          {corpo}
        </p>
      )}

      {erro && (
        <p className="mt-3 text-xs text-rose-400">{erro}</p>
      )}

      <div className="mt-4">
        {desafio.concluido ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-500">
            <Check size={16} />
            Concluído
          </span>
        ) : (
          <Button size="sm" onClick={concluir} loading={processando}>
            Marcar como concluído
          </Button>
        )}
      </div>
    </Card>
  );
}
