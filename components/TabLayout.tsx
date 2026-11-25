"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS } from "@/lib/nav-sections";

const TABS = [
  { href: "/brief",     label: "Brief" },
  { href: "/solution",  label: "Solution" },
  { href: "/prototype", label: "Prototype" },
];

export default function TabLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const subsections = NAV_SECTIONS[pathname] ?? [];


  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-border flex flex-col sticky top-0 h-screen">
        {/* Wordmark */}
        <div className="px-5 py-5 border-b border-border">
          <span className="font-display font-bold text-xl text-accent tracking-tight">SCAI</span>
          <p className="text-[12px] font-[500] text-foreground mt-1">CCI STEM Connect</p>
          <p className="text-[11px] text-muted-foreground">Ola Fakomi · 24 Nov 2026</p>
        </div>

        {/* Nav */}
        <nav className="flex flex-col py-3 flex-1 overflow-y-auto" aria-label="Sections">
          {TABS.map((t) => {
            const active = pathname === t.href;
            const subs = NAV_SECTIONS[t.href] ?? [];
            return (
              <div key={t.href} className="mb-1">
                <Link
                  href={t.href}
                  className={cn(
                    "block px-5 py-1 text-[13px] transition-colors",
                    active
                      ? "text-foreground font-[500]"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                </Link>
                {active && subs.length > 0 && (
                  <div className="flex flex-col mt-0.5">
                    {subs.map((s) => (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        className="pl-8 pr-4 py-0.5 text-[12px] text-muted-foreground hover:text-accent transition-colors border-l-2 border-transparent hover:border-accent ml-5 truncate"
                      >
                        {s.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* PDF button */}
        <div className="px-3 py-4 border-t border-border">
          <Button variant="outline" size="sm" asChild className="w-full gap-1.5">
            <a href="/scai-pitch-deck.pdf" download>
              <Download className="h-3 w-3" />
              Download PDF
            </a>
          </Button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
