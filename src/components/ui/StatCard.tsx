import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

export function StatCard({
  icon: Icon,
  label,
  value,
  accent = "text-indigo-400",
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: string;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={18} className={accent} aria-hidden />
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 font-heading text-2xl font-bold text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </Card>
  );
}
