"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Bot, Send, Sparkles, ArrowRight, RotateCcw } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import type { ChatMensagem, ChatResposta, RotinaComTarefas } from "@/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const LIMITE_CONTENT = 2000;

const INTRO =
  "Me conte o que você quer estudar: o tema, seu nível atual, quanto tempo por " +
  "sessão e com que frequência. Eu monto a rotina pra você.";

const SUGESTOES = [
  "Quero estudar inglês, nível básico, 30 min por dia, 4x na semana",
  "Cálculo I do zero, 1h por dia, 5x na semana",
  "Revisar história do Brasil para o ENEM, 45 min, 3x na semana",
];

export default function ChatPage() {
  const [historico, setHistorico] = useState<ChatMensagem[]>([]);
  const [rascunho, setRascunho] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [limiteAtingido, setLimiteAtingido] = useState(false);
  const [rotina, setRotina] = useState<RotinaComTarefas | null>(null);
  const [chamadasRestantes, setChamadasRestantes] = useState<number | null>(null);

  const fimRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [historico, enviando, rotina]);

  // Auto-resize do textarea (até ~5 linhas).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [rascunho]);

  const bloqueado = enviando || limiteAtingido || rotina !== null;

  async function enviar(texto: string) {
    const conteudo = texto.trim();
    if (!conteudo || bloqueado) return;
    if (conteudo.length > LIMITE_CONTENT) {
      setErro(`Mensagem muito longa (máximo de ${LIMITE_CONTENT} caracteres).`);
      return;
    }

    const anterior = historico;
    const novoHistorico: ChatMensagem[] = [
      ...anterior,
      { role: "user", content: conteudo },
    ];

    setErro(null);
    setHistorico(novoHistorico);
    setRascunho("");
    setEnviando(true);

    try {
      const resposta = await api<ChatResposta>("/api/rotinas/chat", {
        method: "POST",
        body: { mensagens: novoHistorico },
      });
      setChamadasRestantes(resposta.chamadasRestantes);

      if (resposta.tipo === "pergunta") {
        setHistorico((h) => [
          ...h,
          { role: "assistant", content: resposta.mensagem },
        ]);
      } else {
        setRotina(resposta.rotina);
      }
    } catch (e) {
      // Desfaz o envio: devolve o texto e tira a mensagem do histórico.
      setHistorico(anterior);
      setRascunho(conteudo);

      if (e instanceof ApiError && e.isRateLimited) {
        setLimiteAtingido(true);
      } else if (e instanceof ApiError && e.isIaUnavailable) {
        setErro(
          "A IA está demorando ou indisponível agora. Tente enviar de novo em instantes.",
        );
      } else {
        setErro(
          e instanceof ApiError
            ? e.message
            : "Não foi possível enviar sua mensagem. Tente de novo.",
        );
      }
    } finally {
      setEnviando(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    void enviar(rascunho);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void enviar(rascunho);
    }
  }

  function reiniciar() {
    setHistorico([]);
    setRotina(null);
    setErro(null);
    setRascunho("");
  }

  const conversaVazia = historico.length === 0;

  return (
    <div className="flex h-[calc(100dvh-8rem)] animate-entrance flex-col md:h-[calc(100dvh-5rem)]">
      <header className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Criar rotina com IA
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Converse com a IA para montar seu plano de estudos.
          </p>
        </div>
        {chamadasRestantes !== null && (
          <span className="shrink-0 rounded-full border border-slate-700 bg-surface px-3 py-1 text-xs font-medium text-slate-400">
            {chamadasRestantes}/10 hoje
          </span>
        )}
      </header>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
          <Bolha autor="assistant">{INTRO}</Bolha>

          {historico.map((m, i) => (
            <Bolha key={i} autor={m.role}>
              {m.content}
            </Bolha>
          ))}

          {enviando && <Digitando />}

          {rotina && <RotinaCriada rotina={rotina} onNova={reiniciar} />}

          <div ref={fimRef} />
        </div>

        <div className="border-t border-slate-800 bg-slate-950/40 p-4 sm:p-5">
          {conversaVazia && !limiteAtingido && (
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void enviar(s)}
                  className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
                >
                  <Sparkles size={13} className="text-amber-400" aria-hidden />
                  {s}
                </button>
              ))}
            </div>
          )}

          {erro && (
            <div className="mb-3">
              <Alert tone="error">{erro}</Alert>
            </div>
          )}

          {limiteAtingido && (
            <div className="mb-3">
              <Alert tone="info">
                Você atingiu o limite de 10 conversas com a IA por hoje. O limite
                reseta amanhã.
              </Alert>
            </div>
          )}

          {rotina ? (
            <Button fullWidth variant="outline" onClick={reiniciar}>
              <RotateCcw size={16} />
              Começar outra rotina
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={rascunho}
                onChange={(e) => setRascunho(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={LIMITE_CONTENT}
                disabled={bloqueado}
                placeholder={
                  limiteAtingido
                    ? "Limite diário atingido"
                    : "Escreva sua mensagem…"
                }
                className="max-h-36 flex-1 resize-none rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
              <Button
                type="submit"
                loading={enviando}
                disabled={!rascunho.trim() || bloqueado}
                className="h-12 w-12 shrink-0 p-0"
                aria-label="Enviar"
              >
                {!enviando && <Send size={18} />}
              </Button>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}

function Bolha({
  autor,
  children,
}: {
  autor: "user" | "assistant";
  children: ReactNode;
}) {
  const isUser = autor === "user";
  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-slate-700" : "bg-indigo-600"
        }`}
      >
        {isUser ? (
          <span className="text-xs font-bold text-slate-200">Eu</span>
        ) : (
          <Bot size={18} className="text-white" aria-hidden />
        )}
      </div>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-sm bg-indigo-600 text-white"
            : "rounded-tl-sm border border-slate-800 bg-slate-800 text-slate-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Digitando() {
  return (
    <div className="flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-600">
        <Bot size={18} className="text-white" aria-hidden />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-800 px-4 py-3.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="size-1.5 animate-bounce rounded-full bg-slate-500"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function RotinaCriada({
  rotina,
  onNova,
}: {
  rotina: RotinaComTarefas;
  onNova: () => void;
}) {
  return (
    <Card glow="success" className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
        Rotina criada
      </p>
      <h2 className="mt-1 font-heading text-lg font-bold text-white">
        {rotina.tema}
      </h2>
      {rotina.descricao && (
        <p className="mt-1 text-sm text-slate-400">{rotina.descricao}</p>
      )}
      <p className="mt-3 text-sm text-slate-300">
        {rotina.tarefas.length} tarefa{rotina.tarefas.length === 1 ? "" : "s"}
      </p>
      <ul className="mt-2 space-y-1.5">
        {rotina.tarefas.slice(0, 4).map((t) => (
          <li key={t.id} className="flex gap-2 text-sm text-slate-400">
            <span className="text-slate-600">•</span>
            {t.titulo}
          </li>
        ))}
        {rotina.tarefas.length > 4 && (
          <li className="text-sm text-slate-500">
            +{rotina.tarefas.length - 4} tarefa
            {rotina.tarefas.length - 4 === 1 ? "" : "s"}
          </li>
        )}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button href={`/rotinas/${rotina.id}`}>
          Ver rotina
          <ArrowRight size={16} />
        </Button>
        <Button variant="ghost" onClick={onNova}>
          Criar outra
        </Button>
      </div>
    </Card>
  );
}
