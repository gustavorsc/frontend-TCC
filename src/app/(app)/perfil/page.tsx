"use client";

import { useState, type FormEvent } from "react";
import { Flame, Star, Pencil, Check, X, LogOut } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { AuthError } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FullscreenLoader } from "@/components/ui/FullscreenLoader";
import { StatCard } from "@/components/ui/StatCard";
import { TextField } from "@/components/ui/TextField";

function iniciais(nome: string | null) {
  if (!nome) return "?";
  const base = nome.includes("@") ? nome.split("@")[0] : nome;
  return base
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const PROVEDOR: Record<string, string> = {
  password: "E-mail e senha",
  "google.com": "Google",
};

export default function PerfilPage() {
  const {
    firebaseUser,
    usuario,
    nomeExibicao,
    carregando,
    atualizarNome,
    excluirConta,
    sair,
  } = useAuth();

  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  if (carregando) return <FullscreenLoader />;
  if (!firebaseUser) return null; // AuthGate redireciona

  const provedor =
    firebaseUser.providerData[0]?.providerId ?? "password";

  function abrirEdicao() {
    setNome(firebaseUser?.displayName ?? "");
    setErro(null);
    setEditando(true);
  }

  async function salvarNome(e: FormEvent) {
    e.preventDefault();
    const limpo = nome.trim();
    if (!limpo) {
      setErro("O nome não pode ficar vazio.");
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      await atualizarNome(limpo);
      setEditando(false);
    } catch (err) {
      setErro(
        err instanceof AuthError
          ? err.message
          : "Não foi possível salvar o nome.",
      );
    } finally {
      setSalvando(false);
    }
  }

  async function confirmarExclusao() {
    setExcluindo(true);
    setErroExclusao(null);
    try {
      await excluirConta();
      // excluirConta faz signOut + redireciona para /login
    } catch (err) {
      setErroExclusao(
        err instanceof ApiError || err instanceof AuthError
          ? err.message
          : "Não foi possível excluir a conta. Tente de novo.",
      );
      setExcluindo(false);
      setConfirmandoExclusao(false);
    }
  }

  const membroDesde = usuario
    ? new Date(usuario.dataCriacao).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="animate-entrance space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Perfil
        </h1>
      </header>

      <Card className="flex items-center gap-4 p-6">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 font-heading text-xl font-bold text-white">
          {iniciais(nomeExibicao)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading text-lg font-bold text-white">
            {nomeExibicao}
          </p>
          <p className="truncate text-sm text-slate-400">{firebaseUser.email}</p>
          {membroDesde && (
            <p className="mt-0.5 text-xs text-slate-500">
              Membro desde {membroDesde}
            </p>
          )}
        </div>
      </Card>

      <section className="grid grid-cols-2 gap-4">
        <StatCard icon={Star} label="XP total" value={usuario?.xpTotal ?? 0} />
        <StatCard
          icon={Flame}
          label="Ofensiva"
          accent="text-amber-400"
          value={`${usuario?.streakAtual ?? 0} dia${
            (usuario?.streakAtual ?? 0) === 1 ? "" : "s"
          }`}
        />
      </section>

      <Card className="divide-y divide-slate-800 p-0">
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-400">Nome</span>
            {!editando && (
              <button
                onClick={abrirEdicao}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
              >
                <Pencil size={13} />
                Editar
              </button>
            )}
          </div>

          {editando ? (
            <form onSubmit={salvarNome} className="mt-2 space-y-3">
              {erro && <Alert tone="error">{erro}</Alert>}
              <TextField
                label="Novo nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoFocus
                required
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditando(false)}
                  disabled={salvando}
                >
                  <X size={14} />
                  Cancelar
                </Button>
                <Button type="submit" size="sm" loading={salvando}>
                  <Check size={14} />
                  Salvar
                </Button>
              </div>
            </form>
          ) : (
            <p className="mt-1 text-white">
              {firebaseUser.displayName ?? nomeExibicao}
            </p>
          )}
        </div>

        <div className="p-5">
          <span className="text-sm text-slate-400">E-mail</span>
          <p className="mt-1 text-white">{firebaseUser.email}</p>
          <p className="mt-1 text-xs text-slate-500">
            Definido pelo provedor de login — não pode ser alterado aqui.
          </p>
        </div>

        <div className="p-5">
          <span className="text-sm text-slate-400">Entrar com</span>
          <p className="mt-1 text-white">
            {PROVEDOR[provedor] ?? provedor}
          </p>
        </div>
      </Card>

      <Card className="p-5">
        <span className="text-sm text-slate-400">Sessão</span>
        <div className="mt-2">
          <Button variant="outline" size="sm" onClick={sair}>
            <LogOut size={14} />
            Sair da conta
          </Button>
        </div>
      </Card>

      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
        <h2 className="font-heading font-bold text-rose-400">Zona de perigo</h2>
        <p className="mt-1 text-sm text-slate-400">
          Excluir a conta apaga permanentemente seu perfil, rotinas, tarefas e
          desafios. Não dá para desfazer.
        </p>
        {erroExclusao && (
          <p className="mt-3 text-xs text-rose-400">{erroExclusao}</p>
        )}
        <div className="mt-4">
          <Button
            className="bg-rose-600 hover:bg-rose-500 active:bg-rose-700"
            size="sm"
            onClick={() => setConfirmandoExclusao(true)}
          >
            Excluir minha conta
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmandoExclusao}
        onClose={() => setConfirmandoExclusao(false)}
        onConfirm={confirmarExclusao}
        title="Excluir sua conta?"
        confirmLabel="Excluir permanentemente"
        danger
        loading={excluindo}
      >
        Todos os seus dados — perfil, rotinas, tarefas e desafios — serão
        apagados. Esta ação é irreversível e você será desconectado.
      </ConfirmDialog>
    </div>
  );
}
