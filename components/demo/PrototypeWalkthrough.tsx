"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";

const STORAGE_KEY = "scai-walkthrough-seen";

const STEPS = [
  {
    title: "Welcome to the SCAI Prototype",
    body: "This is a live simulation of the STEM Connect Attendee Index. Three views — Attendee, Staff, and Organizer — show how data flows through the event in real time.",
    visual: "✦",
  },
  {
    title: "Start with Simulate",
    body: "Hit the Simulate button in the control bar to generate a full event dataset: 200 attendees check in, make connections, log segment codes, and earn scores.",
    visual: "▶",
  },
  {
    title: "Act as an attendee",
    body: "Pick one of four attendees — one per STEM group — to explore the mobile experience. See their tag, live score, and post-event survey.",
    visual: "①",
  },
  {
    title: "Switch between views",
    body: "Staff see the check-in desk and live session control. Organizer sees the full leaderboard, KPIs, and network graph. The same data, three perspectives.",
    visual: "⇄",
  },
];

export default function PrototypeWalkthrough() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setOpen(true);
    }
  }, []);

  const open_ = () => { setStep(0); setOpen(true); };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else dismiss();
  };

  const prev = () => setStep(step - 1);

  const current = STEPS[step];

  return (
    <>
      {/* Persistent help button */}
      <button
        onClick={open_}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-1.5 px-3 py-2 rounded-full bg-card border border-border shadow-md text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
      >
        <Icon icon="solar:question-circle-linear" className="h-3.5 w-3.5" /> How to use
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Icon icon="solar:close-circle-linear" className="h-4 w-4" />
            </button>

            {/* Visual */}
            <div className="bg-accent/10 border-b border-border flex items-center justify-center py-10">
              <span className="text-6xl text-accent select-none">{current.visual}</span>
            </div>

            {/* Content */}
            <div className="p-6 space-y-2">
              <p className="text-[11px] font-[600] text-muted-foreground uppercase tracking-widest tabular-nums">
                {step + 1} / {STEPS.length}
              </p>
              <h2 className="font-display text-xl text-foreground">{current.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{current.body}</p>
            </div>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-1.5 pb-2">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === step ? "w-5 bg-accent" : "w-1.5 bg-border"
                  )}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 px-6 pb-6 pt-2">
              {step > 0 && (
                <Button variant="ghost" size="sm" className="flex-1" onClick={prev}>
                  Back
                </Button>
              )}
              <Button size="sm" className="flex-1" onClick={next}>
                {step < STEPS.length - 1 ? "Next" : "Get started"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
