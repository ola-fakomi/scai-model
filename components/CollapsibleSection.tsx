"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { useAccordion } from "@/components/AccordionGroup";

interface Props {
  id: string;
  title: string;
  index: string;
  children: React.ReactNode;
  contentClass?: string;
}

export default function CollapsibleSection({ id, title, index, children, contentClass }: Props) {
  const accordion = useAccordion();

  // Controlled by AccordionGroup if present, otherwise self-managed
  const [localOpen, setLocalOpen] = useState(true);
  const open = accordion ? accordion.openId === id : localOpen;
  const toggle = accordion ? () => accordion.toggle(id) : () => setLocalOpen((o) => !o);

  return (
    <section id={id} className="scroll-mt-6">
      <button
        onClick={toggle}
        className="flex items-baseline gap-3 mb-5 w-full text-left group"
      >
        <span className="text-[11px] font-[600] text-muted-foreground tabular-nums tracking-widest uppercase">
          {index}
        </span>
        <h2 className="font-display text-2xl text-foreground flex-1">{title}</h2>
        <Icon
          icon="solar:alt-arrow-down-linear"
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 self-center",
            !open && "-rotate-90"
          )}
        />
      </button>
      {open && (
        <div className={cn("space-y-3 ml-7 text-sm pb-4", contentClass)}>
          {children}
        </div>
      )}
    </section>
  );
}
