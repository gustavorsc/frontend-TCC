"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ComponentProps, type ReactNode } from "react";

export type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  /** Conteúdo à direita do label (ex.: link "Esqueceu a senha?"). */
  labelAction?: ReactNode;
  hint?: string;
  error?: string;
};

export function TextField({
  label,
  labelAction,
  hint,
  error,
  type = "text",
  className = "",
  ...rest
}: TextFieldProps) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
        {labelAction}
      </div>

      <div className="relative">
        <input
          id={id}
          type={inputType}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={[
            "w-full rounded-xl border bg-slate-900 px-4 py-3 text-white placeholder-slate-500",
            "transition-colors focus:outline-none focus:ring-1",
            isPassword ? "pr-11" : "",
            error
              ? "border-rose-500/70 focus:border-rose-500 focus:ring-rose-500"
              : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500",
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
          >
            {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-rose-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
