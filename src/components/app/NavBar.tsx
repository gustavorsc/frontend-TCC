"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Sparkles,
  TrendingUp,
  Trophy,
  User,
  LogOut,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/brand/Logo";

type Item = { href: string; label: string; icon: LucideIcon };

const ITENS: Item[] = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/rotinas", label: "Rotinas", icon: ListChecks },
  { href: "/chat", label: "Chat IA", icon: Sparkles },
  { href: "/progresso", label: "Progresso", icon: TrendingUp },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/perfil", label: "Perfil", icon: User },
];

function ativo(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Sidebar em telas md+; barra inferior no mobile. */
export function NavBar() {
  const pathname = usePathname();
  const { sair } = useAuth();

  return (
    <>
      {/* Desktop — sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-slate-800 bg-surface p-4 md:flex">
        <div className="px-2 py-3">
          <Logo href="/dashboard" />
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {ITENS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={ativo(pathname, href) ? "page" : undefined}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                ativo(pathname, href)
                  ? "bg-indigo-500/10 text-indigo-300"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
              ].join(" ")}
            >
              <Icon size={20} aria-hidden />
              {label}
            </Link>
          ))}
        </nav>

        <button
          onClick={sair}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
        >
          <LogOut size={20} aria-hidden />
          Sair
        </button>
      </aside>

      {/* Mobile — barra inferior */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-800 bg-surface/95 backdrop-blur md:hidden">
        {ITENS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={ativo(pathname, href) ? "page" : undefined}
            className={[
              "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors",
              ativo(pathname, href)
                ? "text-indigo-300"
                : "text-slate-500 hover:text-slate-200",
            ].join(" ")}
          >
            <Icon size={20} aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
