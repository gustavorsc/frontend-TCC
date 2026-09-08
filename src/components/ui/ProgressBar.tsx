type Color = "brand" | "success" | "warning";
type Height = "sm" | "md" | "lg";

const TRACK: Record<Color, string> = {
  brand: "bg-indigo-500",
  success: "bg-emerald-500",
  warning: "bg-amber-400",
};

const HEIGHT: Record<Height, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-3.5",
};

export type ProgressBarProps = {
  /** 0–100 */
  progress: number;
  color?: Color;
  height?: Height;
  showLabel?: boolean;
  className?: string;
};

export function ProgressBar({
  progress,
  color = "brand",
  height = "md",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const value = Math.min(100, Math.max(0, progress));

  return (
    <div className={className}>
      <div
        className={`w-full overflow-hidden rounded-full bg-slate-800 ${HEIGHT[height]}`}
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${TRACK[color]}`}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1.5 text-right text-xs font-medium text-slate-400">
          {Math.round(value)}%
        </p>
      )}
    </div>
  );
}
