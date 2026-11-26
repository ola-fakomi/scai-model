"use client";

import { useDemoStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { SEGMENTS_IN_ORDER, type Segment } from "@/lib/types";

const SEGMENT_LABELS: Record<Segment, string> = {
  keynote:      "Keynote",
  panel:        "Panel",
  networking:   "Networking",
  breakouts:    "Breakouts",
  refreshments: "Refreshments",
};

const SEGMENT_ICONS: Record<Segment, string> = {
  keynote:      "solar:microphone-linear",
  panel:        "solar:users-group-two-rounded-linear",
  networking:   "solar:link-linear",
  breakouts:    "solar:branching-paths-up-linear",
  refreshments: "solar:cup-hot-linear",
};

export default function DemoShell({ children }: { children: React.ReactNode }) {
  const store = useDemoStore();
  const { attendees, simulateEvent, resetDemo, active_segment, ended_segments, startSegment, endSegment, triggerPhotoTime, photo_time_active } = store;

  const hasData = attendees.length > 0;
  const checkedInCount = attendees.filter((a) => a.checked_in_at).length;

  const handleRestart = () => {
    if (confirm("Restart simulation? This will clear all current data.")) {
      resetDemo();
      simulateEvent();
    }
  };

  const handleSegmentClick = (seg: Segment) => {
    if (active_segment?.segment === seg) {
      endSegment(seg);
    } else {
      startSegment(seg);
    }
  };

  return (
    <div className="space-y-0">
      {/* Control bar */}
      <div className="bg-card border border-border rounded-lg mb-6">
        {/* Top row: label + simulate/restart */}
        <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-border">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-[500] text-muted-foreground uppercase tracking-wider">Demo</span>
            {checkedInCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">{checkedInCount} attendees</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!hasData ? (
              <Tooltip tip="Generate 200 attendees, connections & scores">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => simulateEvent()}>
                  <Icon icon="solar:play-linear" className="h-3 w-3" /> Simulate
                </Button>
              </Tooltip>
            ) : (
              <Tooltip tip="Clear data and run a fresh simulation">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={handleRestart}>
                  <Icon icon="solar:restart-linear" className="h-3 w-3" /> Restart
                </Button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Segment timeline — only shown once data exists */}
        {hasData && (
          <div className="px-4 py-2.5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-[500] text-muted-foreground uppercase tracking-wider shrink-0">Segments</span>
            <div className="flex flex-wrap gap-1.5">
              {SEGMENTS_IN_ORDER.map((seg) => {
                const isActive  = active_segment?.segment === seg;
                const isEnded   = ended_segments.includes(seg);
                return (
                  <Tooltip
                    key={seg}
                    tip={isActive ? `End ${SEGMENT_LABELS[seg]}` : isEnded ? `${SEGMENT_LABELS[seg]} ended` : `Start ${SEGMENT_LABELS[seg]}`}
                  >
                    <button
                      onClick={() => handleSegmentClick(seg)}
                      disabled={isEnded && !isActive}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-[500] border transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : isEnded
                          ? "bg-secondary/40 text-muted-foreground border-transparent line-through opacity-50 cursor-default"
                          : "bg-background text-foreground border-border hover:border-primary/50 hover:text-primary"
                      )}
                    >
                      <Icon icon={SEGMENT_ICONS[seg]} className="h-3 w-3" />
                      {SEGMENT_LABELS[seg]}
                    </button>
                  </Tooltip>
                );
              })}
            </div>

            {/* Active segment code + photo time */}
            {active_segment && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[11px] text-muted-foreground">Code:</span>
                <code className="text-[13px] font-mono font-bold tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {active_segment.code}
                </code>
                {(active_segment.segment === "networking" || active_segment.segment === "breakouts") && !photo_time_active && (
                  <Tooltip tip="Trigger group photo prompt on attendee screens">
                    <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1 ml-1" onClick={() => triggerPhotoTime()}>
                      <Icon icon="solar:camera-linear" className="h-3 w-3" /> Photo time
                    </Button>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}
