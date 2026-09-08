import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "error" | "success" | "info";

const TONES: Record<
  Tone,
  { wrap: string; icon: typeof AlertCircle; iconClass: string }
> = {
  error: {
    wrap: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    icon: AlertCircle,
    iconClass: "text-rose-400",
  },
  success: {
    wrap: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    icon: CheckCircle2,
    iconClass: "text-emerald-400",
  },
  info: {
    wrap: "border-indigo-500/30 bg-indigo-500/10 text-indigo-200",
    icon: Info,
    iconClass: "text-indigo-400",
  },
};

export function Alert({
  tone = "error",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  const { wrap, icon: Icon, iconClass } = TONES[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-xl border p-3 text-sm ${wrap}`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconClass}`} aria-hidden />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
