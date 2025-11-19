"use client";

import { cn } from "@/lib/utils";

export function FloatingGif({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt={alt || ""}
      className={cn("pointer-events-none select-none absolute", className)}
      style={style}
    />
  );
}
