"use client";

import { useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Pencil,
  Plus,
  Trash2,
  Loader2,
  X,
} from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { useApiQuery } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import type { RotinaComTarefas, Tarefa } from "@/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorRetry } from "@/components/ui/ErrorRetry";
import { FullscreenLoader } from "@/components/ui/FullscreenLoader";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TextField } from "@/components/ui/TextField";

export default function RotinaDetalhePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { recarregarUsuario } = useAuth();
  const path = `/api/rotinas/${id}`;
  const query = useApiQuery<RotinaComTarefas>(path);

  // `override` assume depois da primeira mutação — evita o flash de "carregando"
  // do `query.recarregar()` a cada ação (concluir tarefa, editar, etc.).
  const [override, setOverride] = useState<RotinaComTarefas | null>(null);
  const rotina = override ?? query.data;

  const [erro, setErro] = useState<string | null>(null);
  const [editandoRotina, setEditandoRotina] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function recarregarRotina() {
    try {
      setOverride(await api<RotinaComTarefas>(path));
    } catch {
      /* mantém o estado atual; a próxima ação mostra o erro */
    }
  }

  if (query.carregando && !rotina) {
    return <FullscreenLoader label="Carregando rotina…" />;
  }
  if (query.error?.code === "ROTINA_NAO_ENCONTRADA") {
    return (
      <NaoEncontrada mensagem="Esta rotina não existe ou foi removida." />
    );
  }
  if (query.error?.code === "ROTINA_ACESSO_NEGADO") {
    return <NaoEncontrada mensagem="Você não tem acesso a esta rotina." />;
  }
  if (query.error || !rotina) {
    return (
      <ErrorRetry
        mensagem="Não foi possível carregar a rotina."
        onRetry={query.recarregar}
      />
    );
  }

  const concluidas = rotina.tarefas.filter((t) => t.concluida).length;

  async function excluirRotina() {
    setExcluindo(true);
    setErro(null);
    try {
      await api(path, { method: "DELETE" });
      router.replace("/rotinas");
    } catch (e) {
      setErro(
        e instanceof ApiError ? e.message : "Não foi possível excluir a rotina.",
      );
      setExcluindo(false);
      setConfirmandoExclusao(false);
    }
  }

  return (
    <div className="animate-entrance space-y-6">
      <button
        onClick={() => router.push("/rotinas")}
        className="flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft size={16} />
        Rotinas
      </button>

      {erro && <Alert tone="error">{erro}</Alert>}

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-white">
              {rotina.tema}
            </h1>
            {rotina.descricao && (
              <p className="mt-1 text-sm text-slate-400">{rotina.descricao}</p>
            )}
          </div>
          <div className="flex shrink-0 gap-1">
            <button
              onClick={() => setEditandoRotina(true)}
              aria-label="Editar rotina"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => setConfirmandoExclusao(true)}
              aria-label="Excluir rotina"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {(rotina.nivelConhecimento ||
          rotina.tempoDisponivel ||
          rotina.frequencia) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              rotina.nivelConhecimento,
              rotina.tempoDisponivel,
              rotina.frequencia,
            ]
              .filter(Boolean)
              .map((v) => (
                <span
                  key={v}
                  className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300"
                >
                  {v}
                </span>
              ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <ProgressBar
            progress={rotina.progresso}
            color={rotina.progresso === 100 ? "success" : "brand"}
            className="flex-1"
          />
          <span className="text-sm font-medium text-slate-300">
            {concluidas}/{rotina.tarefas.length}
          </span>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-bold text-white">Tarefas</h2>

        {rotina.tarefas.map((tarefa) => (
          <TarefaItem
            key={tarefa.id}
            tarefa={tarefa}
            ehUltima={rotina.tarefas.length === 1}
            aoMudar={async () => {
              await recarregarRotina();
              await recarregarUsuario();
            }}
            aoErro={setErro}
          />
        ))}

        <AddTarefaForm
          rotinaId={rotina.id}
          aoAdicionar={recarregarRotina}
          aoErro={setErro}
        />
      </section>

      {editandoRotina && (
        <EditarRotinaModal
          rotina={rotina}
          onClose={() => setEditandoRotina(false)}
          aoSalvar={async () => {
            setEditandoRotina(false);
            await recarregarRotina();
          }}
        />
      )}

      <ConfirmDialog
        open={confirmandoExclusao}
        onClose={() => setConfirmandoExclusao(false)}
        onConfirm={excluirRotina}
        title="Excluir rotina?"
        confirmLabel="Excluir"
        danger
        loading={excluindo}
      >
        A rotina <strong>{rotina.tema}</strong> e as suas{" "}
        {rotina.tarefas.length} tarefa
        {rotina.tarefas.length === 1 ? "" : "s"} serão apagadas. Isso não pode ser
        desfeito.
      </ConfirmDialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function TarefaItem({
  tarefa,
  ehUltima,
  aoMudar,
  aoErro,
}: {
  tarefa: Tarefa;
  ehUltima: boolean;
  aoMudar: () => Promise<void>;
  aoErro: (m: string | null) => void;
}) {
  const [processando, setProcessando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [titulo, setTitulo] = useState(tarefa.titulo);
  const [descricao, setDescricao] = useState(tarefa.descricao ?? "");

  async function concluir() {
    if (tarefa.concluida || processando) return;
    setProcessando(true);
    aoErro(null);
    try {
      await api(`/api/tarefas/${tarefa.id}/concluir`, { method: "PATCH" });
      await aoMudar();
    } catch (e) {
      aoErro(
        e instanceof ApiError
          ? e.message
          : "Não foi possível concluir a tarefa.",
      );
    } finally {
      setProcessando(false);
    }
  }

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    setProcessando(true);
    aoErro(null);
    try {
      await api(`/api/tarefas/${tarefa.id}`, {
        method: "PUT",
        body: { titulo: titulo.trim(), descricao: descricao.trim() || null },
      });
      setEditando(false);
      await aoMudar();
    } catch (err) {
      aoErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar a tarefa.",
      );
    } finally {
      setProcessando(false);
    }
  }

  async function excluir() {
    setProcessando(true);
    aoErro(null);
    try {
      await api(`/api/tarefas/${tarefa.id}`, { method: "DELETE" });
      await aoMudar();
    } catch (err) {
      aoErro(
        err instanceof ApiError && err.code === "ROTINA_SEM_TAREFA"
          ? "Uma rotina precisa ter ao menos uma tarefa."
          : err instanceof ApiError
            ? err.message
            : "Não foi possível remover a tarefa.",
      );
      setProcessando(false);
      setConfirmandoExclusao(false);
    }
  }

  if (editando) {
    return (
      <Card className="p-4">
        <form onSubmit={salvar} className="space-y-3">
          <TextField
            label="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
          <TextField
            label="Descrição (opcional)"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditando(false);
                setTitulo(tarefa.titulo);
                setDescricao(tarefa.descricao ?? "");
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={processando}>
              Salvar
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className={`flex items-start gap-3 p-4 ${tarefa.concluida ? "opacity-70" : ""}`}>
      <button
        onClick={concluir}
        disabled={tarefa.concluida || processando}
        aria-label={tarefa.concluida ? "Tarefa concluída" : "Concluir tarefa"}
        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
          tarefa.concluida
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-600 text-transparent hover:border-indigo-400"
        } disabled:cursor-default`}
      >
        {processando ? (
          <Loader2 size={14} className="animate-spin text-slate-400" />
        ) : (
          <Check size={14} />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-medium ${
            tarefa.concluida ? "text-slate-400 line-through" : "text-white"
          }`}
        >
          {tarefa.titulo}
        </p>
        {tarefa.descricao && (
          <p className="mt-0.5 text-xs text-slate-500">{tarefa.descricao}</p>
        )}
        {tarefa.concluida && (
          <p className="mt-1 text-xs font-medium text-emerald-500">
            +{tarefa.xpConcedido} XP
          </p>
        )}
      </div>

      {!tarefa.concluida && (
        <div className="flex shrink-0 gap-0.5">
          <button
            onClick={() => setEditando(true)}
            aria-label="Editar tarefa"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => {
              if (ehUltima) {
                aoErro("Uma rotina precisa ter ao menos uma tarefa.");
                return;
              }
              setConfirmandoExclusao(true);
            }}
            aria-label="Remover tarefa"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmandoExclusao}
        onClose={() => setConfirmandoExclusao(false)}
        onConfirm={excluir}
        title="Remover tarefa?"
        confirmLabel="Remover"
        danger
        loading={processando}
      >
        A tarefa <strong>{tarefa.titulo}</strong> será removida da rotina.
      </ConfirmDialog>
    </Card>
  );
}

/* ------------------------------------------------------------------ */

function AddTarefaForm({
  rotinaId,
  aoAdicionar,
  aoErro,
}: {
  rotinaId: string;
  aoAdicionar: () => Promise<void>;
  aoErro: (m: string | null) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;
    setSalvando(true);
    aoErro(null);
    try {
      await api(`/api/rotinas/${rotinaId}/tarefas`, {
        method: "POST",
        body: { titulo: titulo.trim(), descricao: descricao.trim() || null },
      });
      setTitulo("");
      setDescricao("");
      setAberto(false);
      await aoAdicionar();
    } catch (err) {
      aoErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível adicionar a tarefa.",
      );
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-700 py-3 text-sm text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-200"
      >
        <Plus size={16} />
        Adicionar tarefa
      </button>
    );
  }

  return (
    <Card className="p-4">
      <form onSubmit={salvar} className="space-y-3">
        <TextField
          label="Título"
          placeholder="Ex.: Resolver a lista 3"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
          autoFocus
        />
        <TextField
          label="Descrição (opcional)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setAberto(false);
              setTitulo("");
              setDescricao("");
            }}
          >
            <X size={14} />
            Cancelar
          </Button>
          <Button type="submit" size="sm" loading={salvando}>
            Adicionar
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* ------------------------------------------------------------------ */

function EditarRotinaModal({
  rotina,
  onClose,
  aoSalvar,
}: {
  rotina: RotinaComTarefas;
  onClose: () => void;
  aoSalvar: () => Promise<void>;
}) {
  const [tema, setTema] = useState(rotina.tema);
  const [descricao, setDescricao] = useState(rotina.descricao ?? "");
  const [nivel, setNivel] = useState(rotina.nivelConhecimento ?? "");
  const [tempo, setTempo] = useState(rotina.tempoDisponivel ?? "");
  const [frequencia, setFrequencia] = useState(rotina.frequencia ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!tema.trim()) {
      setErro("O tema não pode ficar vazio.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      await api(`/api/rotinas/${rotina.id}`, {
        method: "PUT",
        body: {
          tema: tema.trim(),
          descricao: descricao.trim() || null,
          nivelConhecimento: nivel.trim() || null,
          tempoDisponivel: tempo.trim() || null,
          frequencia: frequencia.trim() || null,
        },
      });
      await aoSalvar();
    } catch (err) {
      setErro(
        err instanceof ApiError
          ? err.message
          : "Não foi possível salvar a rotina.",
      );
      setSalvando(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Editar rotina">
      <form onSubmit={salvar} className="space-y-3">
        {erro && <Alert tone="error">{erro}</Alert>}
        <TextField
          label="Tema"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          required
        />
        <TextField
          label="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <TextField
          label="Nível"
          value={nivel}
          onChange={(e) => setNivel(e.target.value)}
        />
        <TextField
          label="Tempo por sessão"
          value={tempo}
          onChange={(e) => setTempo(e.target.value)}
        />
        <TextField
          label="Frequência"
          value={frequencia}
          onChange={(e) => setFrequencia(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={salvando}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */

function NaoEncontrada({ mensagem }: { mensagem: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-surface p-10 text-center">
      <p className="text-sm text-slate-400">{mensagem}</p>
      <Button href="/rotinas" variant="outline" size="sm">
        <ArrowLeft size={16} />
        Voltar para as rotinas
      </Button>
    </div>
  );
}
