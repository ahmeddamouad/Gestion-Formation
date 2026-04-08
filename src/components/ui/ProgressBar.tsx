interface ProgressBarProps {
  value: number;
  max: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gradient";
}

export default function ProgressBar({
  value,
  max,
  showLabel = true,
  size = "md",
  variant = "default",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const isFull = value >= max;

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const getColor = () => {
    if (isFull) return "bg-red-500";
    if (percentage >= 80) return "bg-amber-500";
    return variant === "gradient"
      ? "bg-gradient-to-r from-teal-500 to-teal-400"
      : "bg-teal-500";
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-text-muted">
            {value} / {max} places
          </span>
          <span
            className={`text-sm font-medium ${isFull ? "text-red-400" : percentage >= 80 ? "text-amber-400" : "text-teal-400"}`}
          >
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={`w-full bg-navy-600 rounded-full overflow-hidden ${sizes[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${value} sur ${max} places`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
