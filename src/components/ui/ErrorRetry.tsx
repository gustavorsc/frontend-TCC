import { RotateCcw, WifiOff } from "lucide-react";
import { Button } from "./Button";

/** Estado de erro de carregamento com botão de tentar de novo (RNF06). */
export function ErrorRetry({
  mensagem = "Não foi possível carregar os dados.",
  onRetry,
}: {
  mensagem?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-surface p-8 text-center">
      <WifiOff size={28} className="text-slate-500" aria-hidden />
      <p className="text-sm text-slate-400">{mensagem}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCcw size={16} />
        Tentar de novo
      </Button>
    </div>
  );
}
