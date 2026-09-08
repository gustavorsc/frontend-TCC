import { Loader2 } from "lucide-react";

export function FullscreenLoader({ label = "Carregando…" }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 size={28} className="animate-spin text-indigo-400" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  );
}
