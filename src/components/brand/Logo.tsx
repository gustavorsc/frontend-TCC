import Link from "next/link";
import { GraduationCap } from "lucide-react";

type Props = {
  /** Só o símbolo, sem o texto. */
  iconOnly?: boolean;
  href?: string;
  className?: string;
};

export function Logo({ iconOnly = false, href, className = "" }: Props) {
  const inner = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="glow-brand flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
        <GraduationCap size={22} aria-hidden />
      </span>
      {!iconOnly && (
        <span className="font-heading text-lg font-bold text-white">
          Rotinas
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Rotinas de Estudo — início">
        {inner}
      </Link>
    );
  }
  return inner;
}
