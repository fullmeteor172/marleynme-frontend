"use client";
import React, { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "@/lib/utils";
import { FiX } from "react-icons/fi";

export const StickyBanner = ({
  className,
  children,
  hideOnScroll = false,
}: {
  className?: string;
  children: React.ReactNode;
  hideOnScroll?: boolean;
}) => {
  const [open, setOpen] = useState(true);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (hideOnScroll && latest > 40) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  });

  return (
    <motion.div
      className={cn(
        "sticky inset-x-0 top-0 z-40 flex min-h-10 w-full items-center justify-center px-3 py-0.5",
        className
      )}
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: open ? 0 : -40, opacity: open ? 1 : 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <div className="flex w-full max-w-5xl items-center justify-center text-sm font-medium">
        {children}
      </div>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: open ? 1 : 0 }}
        onClick={() => setOpen(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
      >
        <FiX className="h-4 w-4 text-white opacity-80 hover:opacity-100 transition" />
      </motion.button>
    </motion.div>
  );
};
