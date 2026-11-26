"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface AccordionCtx {
  openId: string | null;
  toggle: (id: string) => void;
}

export const AccordionContext = createContext<AccordionCtx | null>(null);

export function useAccordion() {
  return useContext(AccordionContext);
}

export default function AccordionGroup({
  children,
  defaultOpen,
}: {
  children: React.ReactNode;
  defaultOpen?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen ?? null);

  const toggle = (id: string) =>
    setOpenId((prev) => (prev === id ? null : id));

  // Listen for sidebar nav clicks and open the matching section
  useEffect(() => {
    const handler = (e: CustomEvent<string>) => setOpenId(e.detail);
    window.addEventListener("accordion-open", handler as EventListener);
    return () => window.removeEventListener("accordion-open", handler as EventListener);
  }, []);

  return (
    <AccordionContext.Provider value={{ openId, toggle }}>
      {children}
    </AccordionContext.Provider>
  );
}
