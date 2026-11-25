"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // On mount: read stored preference, apply class, sync state — once only
  useEffect(() => {
    const stored = localStorage.getItem("scai-theme") as Theme | null;
    const resolved: Theme = stored === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", resolved === "dark");
    setTheme(resolved);
  }, []);

  // Toggle: compute next outside the updater (Strict Mode calls updaters twice)
  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("scai-theme", next);
    setTheme(next);
  };

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
