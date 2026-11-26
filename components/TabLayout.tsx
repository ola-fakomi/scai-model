"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS } from "@/lib/nav-sections";

const TABS = [
  { linkTo: "/brief",              base: "/brief",     label: "Brief",     icon: "solar:document-text-linear" },
  { linkTo: "/model",              base: "/model",     label: "Model",     icon: "solar:graph-up-linear" },
  { linkTo: "/prototype/attendee", base: "/prototype", label: "Prototype", icon: "solar:smartphone-linear" },
];

const PROTOTYPE_ROLES = [
  { href: "/prototype/attendee", label: "Attendee" },
  { href: "/prototype/staff",    label: "Staff" },
  { href: "/prototype/organizer",label: "Organizer" },
];

export default function TabLayout({
  children,
  wide,
  fullBleed,
}: {
  children: React.ReactNode;
  wide?: boolean;
  fullBleed?: boolean;
}) {
  const pathname = usePathname();

  const isProto = pathname.startsWith("/prototype");

  return (
    <div className="bg-background">

      {/* ── Mobile top bar ─────────────────────────────────────── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 flex items-center justify-between px-4 bg-background/95 backdrop-blur-sm border-b border-border">
        <span
          className="text-lg text-accent tracking-tight"
          style={{ fontFamily: "'Glegoo', sans-serif", fontWeight: 700 }}
        >
          SCAI
        </span>
        <div className="text-right leading-tight">
          <p className="text-[11px] font-[500] text-foreground">CCI STEM Connect</p>
          <p className="text-[10px] text-muted-foreground">Ola Fakomi</p>
        </div>
      </header>

      {/* ── Mobile prototype role bar ──────────────────────────── */}
      {isProto && (
        <nav className="md:hidden fixed top-14 inset-x-0 z-[39] h-10 flex items-center px-4 gap-2 bg-background/95 backdrop-blur-sm border-b border-border">
          {PROTOTYPE_ROLES.map((r) => {
            const roleActive = pathname === r.href;
            return (
              <Link
                key={r.href}
                href={r.href}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-[500] transition-colors",
                  roleActive
                    ? "bg-accent text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r.label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* ── Layout (sidebar on desktop, stacked on mobile) ──────── */}
      <div className="min-h-screen md:flex">

        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-52 shrink-0 border-r border-border flex-col sticky top-0 h-screen">
          {/* Wordmark */}
          <div className="px-5 py-5 border-b border-border">
            <span
              className="text-xl text-accent tracking-tight"
              style={{ fontFamily: "'Glegoo', sans-serif", fontWeight: 700 }}
            >
              SCAI
            </span>
            <p className="text-[12px] font-[500] text-foreground mt-1">CCI STEM Connect</p>
            <p className="text-[11px] text-muted-foreground">Ola Fakomi</p>
          </div>

          {/* Nav */}
          <nav className="flex flex-col py-3 flex-1 overflow-y-auto" aria-label="Sections">
            {TABS.map((t) => {
              const active = pathname === t.base || pathname.startsWith(t.base + "/");
              const isProto = t.base === "/prototype";
              const anchorSubs = NAV_SECTIONS[t.base] ?? [];

              return (
                <div key={t.base} className="mb-1">
                  <Link
                    href={t.linkTo}
                    className={cn(
                      "block px-5 py-1 text-[13px] transition-colors",
                      active ? "text-foreground font-[500]" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t.label}
                  </Link>

                  {/* Prototype: role sub-nav */}
                  {active && isProto && (
                    <div className="flex flex-col mt-0.5">
                      {PROTOTYPE_ROLES.map((r) => {
                        const roleActive = pathname === r.href;
                        return (
                          <Link
                            key={r.href}
                            href={r.href}
                            className={cn(
                              "pl-8 pr-4 py-0.5 text-[12px] transition-colors border-l-2 ml-5 truncate",
                              roleActive
                                ? "text-accent border-accent font-[500]"
                                : "text-muted-foreground border-transparent hover:text-accent hover:border-accent"
                            )}
                          >
                            {r.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Brief / Model: anchor sub-nav */}
                  {active && !isProto && anchorSubs.length > 0 && (
                    <div className="flex flex-col mt-0.5">
                      {anchorSubs.map((s) => (
                        <a
                          key={s.id}
                          href={`#${s.id}`}
                          onClick={() =>
                            window.dispatchEvent(new CustomEvent("accordion-open", { detail: s.id }))
                          }
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

          {/* Watch demo */}
          <div className="px-3 py-4 border-t border-border">
            <Button variant="outline" size="sm" asChild className="w-full gap-1.5">
              <Link href="/prototype/attendee">
                <Icon icon="solar:play-linear" className="h-3 w-3" />
                Watch demo
              </Link>
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className={cn("flex-1 min-w-0 pb-16 md:pt-0 md:pb-0", isProto ? "pt-24" : "pt-14")}>
          <div
            className={cn(
              !fullBleed &&
                cn(
                  "mx-auto px-4 md:px-8 py-6 md:py-10",
                  wide ? "max-w-5xl" : "max-w-3xl"
                )
            )}
          >
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom nav ───────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-stretch">
          {TABS.map((t) => {
            const active = pathname === t.base || pathname.startsWith(t.base + "/");
            return (
              <Link
                key={t.base}
                href={t.linkTo}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon icon={t.icon} className="h-5 w-5" />
                <span className="text-[10px] font-[500]">{t.label}</span>
              </Link>
            );
          })}

          {/* Watch demo — play button */}
          <Link
            href="/prototype/attendee"
            className="flex-1 flex flex-col items-center justify-center gap-0.5"
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <Icon icon="solar:play-linear" className="h-4 w-4 text-white translate-x-px" />
            </div>
            <span className="text-[10px] font-[500] text-primary">Watch</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
