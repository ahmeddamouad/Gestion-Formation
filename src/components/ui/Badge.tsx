interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  children: React.ReactNode;
  dot?: boolean;
}

export default function Badge({
  variant = "neutral",
  size = "md",
  children,
  dot = false,
}: BadgeProps) {
  const variants = {
    success: "bg-green-500/20 text-green-400 border-green-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    danger: "bg-red-500/20 text-red-400 border-red-500/30",
    info: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    neutral: "bg-navy-600 text-text-muted border-border-light",
  };

  const dotColors = {
    success: "bg-green-400",
    warning: "bg-amber-400",
    danger: "bg-red-400",
    info: "bg-teal-400",
    neutral: "bg-text-muted",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${variants[variant]}
        ${sizes[size]}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
