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

export default function LoginPage() {
  const router = useRouter();
  const { entrarComEmail, entrarComGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState<"email" | "google" | null>(null);

  function traduzErro(e: unknown) {
    setErro(
      e instanceof AuthError
        ? e.message
        : "Não foi possível entrar. Tente novamente.",
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (enviando) return;
    setErro(null);
    setEnviando("email");
    try {
      await entrarComEmail(email.trim(), senha);
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
            Bem-vindo de volta
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Entre para continuar sua rotina de estudos.
          </p>
        </div>

        {erro && (
          <div className="mb-5">
            <Alert tone="error">{erro}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
            autoComplete="current-password"
            placeholder="Sua senha"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            labelAction={
              <Link
                href="/recuperar-senha"
                className="text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Esqueceu a senha?
              </Link>
            }
          />

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={enviando === "email"}
            className="mt-2"
          >
            Entrar
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
          Não tem uma conta?{" "}
          <Link
            href="/cadastro"
            className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
          >
            Cadastre-se
          </Link>
        </p>
      </Card>
    </div>
  );
}
