"use client";

interface ModeToggleProps {
  value: "presentiel" | "visio";
  onChange: (mode: "presentiel" | "visio") => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export default function ModeToggle({
  value,
  onChange,
  disabled = false,
  size = "md",
}: ModeToggleProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <div className="inline-flex rounded-lg bg-navy-800 p-1 border border-border">
      <button
        type="button"
        onClick={() => onChange("presentiel")}
        disabled={disabled}
        className={`
          ${sizeClasses[size]} font-medium rounded-md transition-all duration-200
          ${
            value === "presentiel"
              ? "bg-teal-500 text-navy-900"
              : "text-text-muted hover:text-text-primary"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        aria-pressed={value === "presentiel"}
      >
        Presentiel
      </button>
      <button
        type="button"
        onClick={() => onChange("visio")}
        disabled={disabled}
        className={`
          ${sizeClasses[size]} font-medium rounded-md transition-all duration-200
          ${
            value === "visio"
              ? "bg-teal-500 text-navy-900"
              : "text-text-muted hover:text-text-primary"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        aria-pressed={value === "visio"}
      >
        Visio
      </button>
    </div>
  );
}
