"use client";

import { cn } from "@/lib/utils";

export function FloatingGif({
  src,
  alt = "",
  className,
  size = 80,
  style,
}: {
  src: string;
  alt?: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("pointer-events-none select-none absolute z-30", className)}
      style={style}
    />
  );
}
