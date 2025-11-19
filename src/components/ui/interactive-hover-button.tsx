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
        "group relative w-auto cursor-pointer overflow-hidden rounded-full border p-2 px-6 text-center font-semibold transition-colors duration-300",
        isPrimary
          ? "bg-orange-500 text-white border-orange-500"
          : "bg-white text-orange-500 border-orange-500 dark:bg-neutral-900 dark:text-orange-400",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full transition-all duration-300",
            isPrimary
              ? "bg-white group-hover:bg-orange-500"
              : "bg-orange-500 group-hover:bg-white"
          )}
        ></div>
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>

      <div
        className={cn(
          "absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100",
          isPrimary ? "text-white" : "text-orange-500 dark:text-orange-400"
        )}
      >
        <span>{children}</span>
        <ArrowRight />
      </div>
    </button>
  );
}
