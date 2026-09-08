import Link from "next/link";
import { Loader2 } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-sm shadow-indigo-950/50",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700",
  outline:
    "border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600",
  ghost: "text-slate-300 hover:bg-slate-800 hover:text-white",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

const BASE =
  "inline-flex items-center justify-center rounded-xl font-medium transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas " +
  "disabled:opacity-50 disabled:pointer-events-none";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function classes({ variant = "primary", size = "md", fullWidth, className }: CommonProps) {
  return [
    BASE,
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? "w-full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth,
    loading,
    children,
    className,
    ...rest
  } = props;

  const cls = classes({ variant, size, fullWidth, className, children });
  const content = (
    <>
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden />}
      {children}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    const { href, ...linkRest } = rest as ButtonAsLink;
    return (
      <Link href={href} className={cls} {...linkRest}>
        {content}
      </Link>
    );
  }

  const { disabled, ...btnRest } = rest as ButtonAsButton;
  return (
    <button className={cls} disabled={disabled || loading} {...btnRest}>
      {content}
    </button>
  );
}
