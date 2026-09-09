"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { AuthError } from "@/lib/auth";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Logo } from "@/components/brand/Logo";
import { GoogleIcon } from "@/components/brand/GoogleIcon";

const DESTINO = "/dashboard";
const SENHA_MIN = 6;

export default function CadastroPage() {
  const router = useRouter();
  const { cadastrarComEmail, entrarComGoogle } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<"email" | "google" | null>(null);

  function traduzErro(e: unknown) {
    setErro(
      e instanceof AuthError
        ? e.message
        : "Não foi possível criar a conta. Tente novamente.",
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (enviando) return;
    setErro(null);
    setErroSenha(null);

    if (senha.length < SENHA_MIN) {
      setErroSenha(`A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`);
      return;
    }

    setEnviando("email");
    try {
      await cadastrarComEmail(email.trim(), senha, nome.trim());
      router.replace(DESTINO);
    } catch (e) {
      traduzErro(e);
      setEnviando(null);
    }
  }

  async function handleGoogle() {
    if (enviando) return;
    setErro(null);
    setEnviando("google");
    try {
      await entrarComGoogle();
      router.replace(DESTINO);
    } catch (e) {
      traduzErro(e);
      setEnviando(null);
    }
  }

  return (
    <div className="animate-entrance">
      <Card glow="brand" className="p-6 sm:p-8">
        <div className="mb-7 flex flex-col items-center text-center">
          <Logo iconOnly />
          <h1 className="mt-4 font-heading text-2xl font-bold text-white">
            Crie sua conta
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Comece a montar sua rotina de estudos com IA.
          </p>
        </div>

        {erro && (
          <div className="mb-5">
            <Alert tone="error">{erro}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <TextField
            label="Nome"
            type="text"
            autoComplete="name"
            placeholder="Como quer ser chamado"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <TextField
            label="E-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="voce@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Senha"
            type="password"
            autoComplete="new-password"
            placeholder="Crie uma senha"
            required
            minLength={SENHA_MIN}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            hint={`Mínimo de ${SENHA_MIN} caracteres.`}
            error={erroSenha ?? undefined}
          />

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={enviando === "email"}
            className="mt-2"
          >
            Criar conta
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-slate-500">
          <span className="h-px flex-1 bg-slate-800" />
          ou
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          fullWidth
          loading={enviando === "google"}
          onClick={handleGoogle}
        >
          {enviando !== "google" && <GoogleIcon className="size-4" />}
          Continuar com o Google
        </Button>

        <p className="mt-6 text-center text-sm text-slate-400">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
          >
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  );
}
