"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  title: string;
  index: string;
  children: React.ReactNode;
  contentClass?: string;
}

export default function CollapsibleSection({ id, title, index, children, contentClass }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <section id={id} className="animate-enter scroll-mt-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-baseline gap-3 mb-5 w-full text-left group"
      >
        <span className="text-[11px] font-[600] text-muted-foreground tabular-nums tracking-widest uppercase">
          {index}
        </span>
        <h2 className="font-display text-2xl text-foreground flex-1">{title}</h2>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 self-center",
            !open && "-rotate-90"
          )}
        />
      </button>
      {open && (
        <div className={cn("space-y-3 ml-7 text-sm", contentClass)}>
          {children}
        </div>
      )}
    </section>
  );
}
