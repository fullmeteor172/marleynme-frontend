// components/ui/interactive-hover-button.tsx
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function InteractiveHoverButton({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";

  return (
    <button
      className={cn(
        // Base glass button
        "group relative w-auto cursor-pointer overflow-hidden rounded-full px-6 py-2 font-semibold transition-all duration-300",
        "backdrop-blur-md border shadow-sm",

        // Light mode base (secondary default)
        "bg-white/40 text-neutral-800 border-neutral-300/60",
        "hover:bg-white/60",

        // Dark mode base (secondary default)
        "dark:bg-white/10 dark:text-neutral-200 dark:border-white/15",
        "dark:hover:bg-white/20",

        // PRIMARY OVERRIDE
        isPrimary &&
          cn(
            // Light mode
            "bg-orange-500 text-white border-orange-500 shadow-[0_2px_6px_rgba(0,0,0,0.25)] hover:bg-orange-600",

            // Dark mode → KEEP ORANGE
            "dark:bg-orange-500 dark:text-white dark:border-orange-500 dark:hover:bg-orange-600"
          ),

        // SECONDARY OVERRIDE
        !isPrimary &&
          cn(
            // Light mode secondary → orange text
            "text-orange-600 border-orange-500/40",

            // Dark mode secondary → WHITE button, orange text
            "dark:bg-white/10 dark:border-white/20 dark:text-white"
          ),

        className
      )}
      {...props}
    >
      {/* LEFT SIDE CONTENT */}
      <div className="flex items-center gap-2">
        {/* DOT */}
        <div
          className={cn(
            "h-2 w-2 rounded-full transition-all duration-300",

            // PRIMARY dot
            isPrimary
              ? "bg-white group-hover:bg-transparent"
              : cn(
                  // SECONDARY dot (light)
                  "bg-orange-500",

                  // SECONDARY dot (dark)
                  "dark:bg-white",

                  // Ensure it fully disappears regardless of theme
                  "group-hover:opacity-0 group-hover:scale-0"
                )
          )}
        />

        {/* LABEL (slides away on hover) */}
        <span className="inline-block transition-all duration-300 group-hover:translate-x-10 group-hover:opacity-0">
          {children}
        </span>
      </div>

      {/* SLIDE-IN CONTENT */}
      <div
        className={cn(
          "absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center gap-2",
          "translate-x-10 opacity-0 transition-all duration-300",
          "group-hover:translate-x-0 group-hover:opacity-100",

          isPrimary ? "text-white" : "text-orange-500 dark:text-white"
        )}
      >
        <span>{children}</span>
        <ArrowRight className="h-4 w-4" />
      </div>
    </button>
  );
}
