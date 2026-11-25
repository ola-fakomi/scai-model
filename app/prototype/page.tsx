"use client";

import TabLayout from "@/components/TabLayout";
import CollapsibleSection from "@/components/CollapsibleSection";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PrototypePage() {
  return (
    <TabLayout>
      <div className="space-y-12 animate-enter">
        <div className="space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl text-foreground leading-tight">Prototype</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
            A mobile-first web app with three views: data collection, the attendee's score and the
            organizer scoreboard. No download required. All names and numbers are sample data.
          </p>
          <div>
            <Button variant="accent" asChild>
              <Link href="/demo">
                Open interactive demo <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        <CollapsibleSection id="data-collection" title="How data is collected" index="01">
          <ScreenshotSection
            screens={[
              { label: "Interest form", src: "/screens/interest-form.png", route: "/demo/attendee" },
              { label: "Tag page", src: "/screens/tag-page.png", route: "/demo/attendee" },
              { label: "Connection confirm", src: "/screens/connection-confirm.png", route: "/demo/attendee" },
            ]}
          />
          <ul className="space-y-2 mt-4">
            {[
              ["Register", "Attendees register on Luma as usual."],
              ["Check in", "Staff scan the Luma ticket at the door."],
              ["Claim a tag", "Attendee scans QR poster → web page confirms check-in → shows interest form → gives next free tag."],
              ["Attend", "At the start of each segment, attendees enter the code shown on screen."],
              ["Scan", "In networking and breakouts, people scan each other's tag QR. The page flags intent matches straight away."],
              ["Confirm", "A connection counts only when both people confirm it."],
              ["Questions", "Attendees say their tag before asking. A note-taker types the tag and scores the question."],
              ["Refreshments", "The usher logs each tag when serving food, recording who stayed to the close."],
            ].map(([label, text], i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed">
                <span className="text-accent mt-0.5 flex-shrink-0 text-xs">▸</span>
                <span className="text-foreground">
                  <span className="font-[500]">{label}:</span>{" "}
                  <span className="text-muted-foreground">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        <CollapsibleSection id="attendee-view" title="What an attendee sees" index="02">
          <ScreenshotSection
            screens={[
              { label: "Score screen", src: "/screens/score-screen.png", route: "/demo/attendee" },
              { label: "Next steps", src: "/screens/next-steps.png", route: "/demo/attendee" },
            ]}
          />
          <p className="mt-4 text-muted-foreground">
            Each attendee sees only their own score, their persona and a pillar breakdown. The
            next-steps screen nudges them to follow up. In this example:
          </p>
          <div className="formula-block">
            0.10 × 90 + 0.15 × 60 + 0.25 × 85 + 0.30 × 80 + 0.20 × 70 = <strong className="text-accent">77</strong>
          </div>
        </CollapsibleSection>

        <CollapsibleSection id="scoreboard" title="The scoreboard" index="03">
          <ScreenshotSection
            screens={[
              { label: "Organizer dashboard", src: "/screens/organizer-dashboard.png", route: "/demo/organizer" },
            ]}
          />
          <p className="mt-4 text-muted-foreground">
            Only organizers see this view. The KPI row shows event health at a glance. The table
            ranks attendees, and each name opens their full pillar breakdown. The unmatched needs panel
            tells organizers who to introduce to whom before the 7-day check-in.
          </p>
          <div className="mt-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/demo/organizer">
                Try the organizer scoreboard <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection id="data-model" title="Data model" index="04">
          <p className="text-muted-foreground">The SCAI score is recalculated each time new data arrives.</p>
          <div className="overflow-x-auto rounded-lg border border-border mt-3">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/60">
                  {["Table", "Key fields", "Feeds pillar"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-[600] text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DATA_MODEL.map(([table, fields, pillar], i) => (
                  <tr key={i} className="border-t border-border/50">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-accent whitespace-nowrap">{table}</td>
                    <td className="px-4 py-2.5 text-muted-foreground text-xs">{fields}</td>
                    <td className="px-4 py-2.5 font-[500] text-foreground text-xs whitespace-nowrap">{pillar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong className="text-foreground">Suggested stack:</strong> Next.js front end, Supabase database, scoring and
            network analysis in a single tested module. Build time ~3 weeks.
          </p>
        </CollapsibleSection>
      </div>
    </TabLayout>
  );
}


function ScreenshotSection({ screens }: { screens: { label: string; src: string; route: string }[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {screens.map((s) => (
        <div key={s.src} className="flex-shrink-0 w-44">
          <div className="bg-secondary border border-border rounded-lg aspect-[9/16] flex items-center justify-center overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.src} alt={s.label} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span className="absolute inset-0 flex items-center justify-center text-[11px] text-muted-foreground p-3 text-center">{s.label}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 text-center">{s.label}</p>
          <Link href={s.route} className="block text-[11px] text-center text-accent hover:underline mt-0.5">
            Try live →
          </Link>
        </div>
      ))}
    </div>
  );
}

const DATA_MODEL = [
  ["attendees", "id, name, Luma ticket ID, number tag, interest group, intent, consent, check-in time", "P, M"],
  ["segment_attendance", "attendee, segment, time the code was entered", "P"],
  ["refreshments", "attendee, time served, usher", "P"],
  ["questions", "number tag, session (keynote or panel), quality score 1–3", "E"],
  ["takeaways", "attendee, takeaway text", "E"],
  ["connections", "attendee A, attendee B, segment, confirmed by both, cross-discipline, intent match", "N, M"],
  ["group_photo_confirms", "group number, attendee, time confirmed", "N"],
  ["surveys", "attendee, day (7, 30 or 90), follow-ups, meetings, outcomes, NPS", "F"],
];
