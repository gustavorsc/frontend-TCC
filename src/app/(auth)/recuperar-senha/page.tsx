"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { AuthError } from "@/lib/auth";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Logo } from "@/components/brand/Logo";

export default function RecuperarSenhaPage() {
  const { recuperarSenha } = useAuth();

  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (enviando) return;
    setErro(null);
    setEnviando(true);
    try {
      await recuperarSenha(email.trim());
      setEnviado(true);
    } catch (e) {
      // Não revela se o e-mail existe: "conta não encontrada" também é sucesso.
      if (e instanceof AuthError && e.code === "auth/user-not-found") {
        setEnviado(true);
      } else if (e instanceof AuthError) {
        setErro(e.message);
      } else {
        setErro("Não foi possível enviar o e-mail. Tente novamente.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="animate-entrance">
      <Card glow="brand" className="p-6 sm:p-8">
        <div className="mb-7 flex flex-col items-center text-center">
          <Logo iconOnly />
          <h1 className="mt-4 font-heading text-2xl font-bold text-white">
            Recuperar senha
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {enviado
              ? "Confira sua caixa de entrada."
              : "Enviamos um link para você criar uma nova senha."}
          </p>
        </div>

        {enviado ? (
          <div className="space-y-5">
            <Alert tone="success">
              Se existe uma conta para <strong>{email.trim()}</strong>, você vai
              receber um e-mail com o link para redefinir a senha. Não esqueça de
              olhar o spam.
            </Alert>
            <Button href="/login" variant="outline" size="lg" fullWidth>
              <ArrowLeft className="size-4" />
              Voltar para o login
            </Button>
          </div>
        ) : (
          <>
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

              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={enviando}
                className="mt-2"
              >
                {!enviando && <MailCheck className="size-4" />}
                Enviar link
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Lembrou a senha?{" "}
              <Link
                href="/login"
                className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Entrar
              </Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
