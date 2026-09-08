import type { ComponentProps } from "react";

type Glow = "brand" | "warning" | "success";

const GLOW: Record<Glow, string> = {
  brand: "glow-brand border-indigo-500/30",
  warning: "glow-warning border-amber-400/30",
  success: "glow-success border-emerald-500/30",
};

export type CardProps = ComponentProps<"div"> & {
  glow?: Glow;
};

export function Card({ glow, className = "", ...rest }: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl border border-slate-800 bg-surface",
        glow ? GLOW[glow] : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
