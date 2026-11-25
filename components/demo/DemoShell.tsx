"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemoStore } from "@/lib/store";
import { shortName } from "@/lib/seed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Play, RotateCcw, Moon, ChevronLeft } from "lucide-react";

const ROLES = [
  { label: "Attendee",  href: "/demo/attendee" },
  { label: "Staff",     href: "/demo/staff" },
  { label: "Organizer", href: "/demo/organizer" },
];

export default function DemoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    attendees,
    active_attendee_id,
    setActiveAttendee,
    simulateEvent,
    resetDemo,
    jumpToAfterMidnight,
    setJumpToAfterMidnight,
  } = useDemoStore();

  const taggedAttendees = attendees.filter((a) => a.tag).slice(0, 50);
  const checkedInCount = attendees.filter((a) => a.checked_in_at).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Demo control bar */}
      <div className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Link href="/brief" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="h-3 w-3" /> Brief
            </Link>
            <Separator orientation="vertical" className="h-4" />
            <span className="font-display text-base text-accent tracking-tight">SCAI</span>
            <span className="text-[11px] font-[500] text-muted-foreground">Demo</span>
            {checkedInCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {checkedInCount} attendees
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1"
              onClick={() => simulateEvent()}
            >
              <Play className="h-3 w-3" /> Simulate
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => { if (confirm("Reset all demo data?")) resetDemo(); }}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-7 text-xs gap-1",
                jumpToAfterMidnight && "bg-accent/15 text-accent border border-accent/25 hover:bg-accent/20"
              )}
              onClick={() => setJumpToAfterMidnight(!jumpToAfterMidnight)}
            >
              <Moon className="h-3 w-3" />
              {jumpToAfterMidnight ? "After midnight" : "Midnight"}
            </Button>
          </div>
        </div>
      </div>

      {/* Role + act-as bar */}
      <div className="bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-0">
            {ROLES.map((r) => {
              const active = pathname === r.href || pathname.startsWith(r.href + "/");
              return (
                <Link
                  key={r.href}
                  href={r.href}
                  className={cn(
                    "px-4 py-3 text-sm font-[500] border-b-2 transition-colors",
                    active
                      ? "border-accent text-accent"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r.label}
                </Link>
              );
            })}

            {pathname.startsWith("/demo/attendee") && taggedAttendees.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-5 mx-2" />
                <div className="flex items-center gap-2 py-2">
                  <span className="text-[11px] text-muted-foreground font-[500] uppercase tracking-wider">Act as</span>
                  <select
                    value={active_attendee_id ?? ""}
                    onChange={(e) => setActiveAttendee(e.target.value || null)}
                    className="text-xs border border-border rounded-md px-2 py-1 bg-secondary text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">— pick an attendee —</option>
                    {taggedAttendees.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.tag} · {shortName(a.name)} · {a.interest_group}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
