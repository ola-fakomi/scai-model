"use client";

import { cn } from "@/lib/utils";

interface TooltipProps {
  tip: string;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom";
}

export function Tooltip({ tip, children, className, side = "top" }: TooltipProps) {
  return (
    <div className={cn("relative group inline-flex", className)}>
      {children}
      <div
        className={cn(
          "pointer-events-none absolute left-1/2 -translate-x-1/2 z-50",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
          "bg-foreground text-background text-[11px] font-medium whitespace-nowrap",
          "px-2 py-1 rounded-md shadow-sm",
          side === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"
        )}
      >
        {tip}
        <span
          className={cn(
            "absolute left-1/2 -translate-x-1/2 border-4 border-transparent",
            side === "top"
              ? "top-full border-t-foreground"
              : "bottom-full border-b-foreground"
          )}
        />
      </div>
    </div>
  );
}
