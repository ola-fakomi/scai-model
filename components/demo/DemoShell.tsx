"use client";

import { useDemoStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Icon } from "@iconify/react";

export default function DemoShell({ children }: { children: React.ReactNode }) {
  const { attendees, simulateEvent, resetDemo } = useDemoStore();

  const hasData = attendees.length > 0;
  const checkedInCount = attendees.filter((a) => a.checked_in_at).length;

  const handleRestart = () => {
    if (confirm("Restart simulation? This will clear all current data.")) {
      resetDemo();
      simulateEvent();
    }
  };

  return (
    <div className="space-y-0">
      {/* Control bar */}
      <div className="bg-card border border-border rounded-lg mb-6">
        <div className="px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-[500] text-muted-foreground uppercase tracking-wider">Demo</span>
            {checkedInCount > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                {checkedInCount} attendees
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!hasData ? (
              <Tooltip tip="Generate 200 attendees, connections & scores">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={() => simulateEvent()}
                >
                  <Icon icon="solar:play-linear" className="h-3 w-3" /> Simulate
                </Button>
              </Tooltip>
            ) : (
              <Tooltip tip="Clear data and run a fresh simulation">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1"
                  onClick={handleRestart}
                >
                  <Icon icon="solar:restart-linear" className="h-3 w-3" /> Restart
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Page content */}
      {children}
    </div>
  );
}
