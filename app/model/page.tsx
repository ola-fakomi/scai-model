import TabLayout from "@/components/TabLayout";
import CollapsibleSection from "@/components/CollapsibleSection";
import AccordionGroup from "@/components/AccordionGroup";
import Diagram2 from "@/components/Diagram2";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

export const metadata = { title: "Model – SCAI Case Study" };

export default function ModelPage() {
  return (
    <TabLayout>
      <div className="space-y-8 animate-enter">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground leading-tight">
            The SCAI Model
          </h1>
        </div>

        <AccordionGroup defaultOpen="how-it-works">
        <div className="space-y-2">

        {/* ── Solution sections ─────────────────────────── */}

        <CollapsibleSection id="how-it-works" title="How it works" index="01" contentClass="text-muted-foreground leading-relaxed">
          <p>
            The STEM Connect Attendee Index (SCAI) combines what happened in each segment of the event with what happened afterwards. Organizers use it to see who engaged, who found what they came for, and where the event fell short.
          </p>
          <p>
            Each part of the event produces one kind of data, which feeds one pillar.
            The five weighted pillars add up to the attendee's SCAI score. Matching carries the most
            weight because the intent cards say what each person came for.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/60">
                  {["Event segment & data source", "Pillar", "What it measures", "Weight"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-[600] text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Whole event · Luma ticket scans",            "P: Presence",       "Check-in time, segments attended, stayed to close",                           "10%",   false],
                  ["Keynote + Panel · Questions by number tag",  "E: Engagement",     "Questions asked (scored 1–3 for quality), keynote and panel takeaways",       "15%",   false],
                  ["Numbered networking · Tag scans, photos",    "N: Networking",     "Contacts confirmed by both people, group photo confirmed, cross-discipline",   "25%",   false],
                  ["Breakouts · Intent cards, matches",          "M: Matching",       "Intent card filled completely, relevant matches found",                        "30% ★", true],
                  ["After the event · 7, 30, 90-day check-ins", "F: Follow-through", "Follow-ups sent, meetings held, outcomes reported at 30 days",                 "20%",   false],
                ].map(([source, pillar, what, weight, highlight], i) => (
                  <tr key={i} className={cn("border-t border-border/50 transition-colors", highlight && "bg-accent/5")}>
                    <td className="px-4 py-3 text-muted-foreground text-sm">{source}</td>
                    <td className={cn("px-4 py-3 font-[500] whitespace-nowrap text-sm", highlight ? "text-accent" : "text-foreground")}>{pillar}</td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">{what}</td>
                    <td className={cn("px-4 py-3 font-[600] whitespace-nowrap text-sm tabular-nums", highlight ? "text-accent" : "text-foreground")}>{weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="formula-block">
            SCAI = 0.10P + 0.15E + 0.25N + <span className="text-accent">0.30M</span> + 0.20F
          </div>
          <p className="text-muted-foreground text-sm">
            Each pillar is scored from 0 to 100 before weighting, so the final SCAI is also out of 100.
          </p>
        </CollapsibleSection>

        <CollapsibleSection id="data-capture" title="Data capture map" index="02" contentClass="text-muted-foreground leading-relaxed">
          <p>Every metric in the pillar table has a defined way to be captured during or after the event.</p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/60">
                  {["Pillar", "Metric", "How it is captured", "When", "Tool"].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[11px] font-[600] text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DATA_CAPTURE_GROUPS.map((group) =>
                  group.rows.map((row, ri) => (
                    <tr key={`${group.pillar}-${ri}`} className="border-t border-border/50">
                      {ri === 0 && (
                        <td
                          rowSpan={group.rows.length}
                          className="px-3 py-2.5 font-[500] text-foreground whitespace-nowrap text-xs align-top border-r border-border/30"
                        >
                          {group.pillar}
                        </td>
                      )}
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">{row.metric}</td>
                      <td className="px-3 py-2.5 text-muted-foreground text-xs">{row.how}</td>
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap text-xs">{row.when}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <Badge variant="secondary" className="font-[400] text-[10px]">{row.tool}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong className="text-foreground">Note:</strong> An attendee who stayed but skipped refreshments counts as "unknown" for Stayed to close.</p>
            <p>Surveys go to the Luma email because the tag expires at midnight on event day.</p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection id="design-choices" title="Design choices" index="03" contentClass="text-muted-foreground leading-relaxed">
          <div className="space-y-3">
            {[
              { title: "Normalize within the cohort",        body: "Each pillar is a percentile against the other attendees, so results reflect relative performance and are not skewed by group size." },
              { title: "Diminishing returns",                body: "Counts use a log scale — 30 shallow handshakes do not beat 6 meaningful connections. Tunde made 5× as many connections as Ada (30 vs 6) but gets less than 2× her score (4.4 vs 2.8)." },
              { title: "Both people must confirm",           body: "It counts only if both people log it, or a photo in the group chat shows them together." },
              { title: "Network graph metrics",              body: "Attendees are treated as a network, with each connection as a link. This finds the bridgers: people who connected different interest groups." },
              { title: "Outcomes over noise",                body: "Quiet attendees who found their match still score well, which keeps the model fair to introverts." },
              { title: "Event-level rollup",                 body: "The same data gives event KPIs: match rate, cross-discipline connection rate, average SCAI by interest group and NPS." },
            ].map((c) => (
              <Card key={c.title} className="border-l-2 border-l-accent/40 rounded-l-none">
                <CardContent className="pt-4 pb-4">
                  <h3 className="font-[500] text-foreground text-sm mb-1">{c.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{c.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection id="how-to-use" title="How to use it" index="04" contentClass="text-muted-foreground leading-relaxed">
          <ol className="space-y-3">
            {HOW_TO_USE.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent border border-accent/25 text-xs font-[600] flex items-center justify-center tabular-nums">
                  {i + 1}
                </span>
                <span className="text-foreground leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: step }} />
              </li>
            ))}
          </ol>
          <div className="mt-5 space-y-3 text-sm text-foreground">
            <p><strong className="text-foreground">How number tags work.</strong> <span className="text-muted-foreground">The number is the networking group and the letter is the person's place in it, so 1A to 1E is group 1. Each group is capped at 5 people. With 200 attendees there would be 40 groups.</span></p>
            <p><strong className="text-foreground">Mixing rule:</strong> <span className="text-muted-foreground">to stop friends who arrive together landing in the same group, the system places each person in the next open group. 3 friends arriving together go to 1A, 2A and 3A.</span></p>
            <p><strong className="text-foreground">One registration system, one web page.</strong> <span className="text-muted-foreground">Luma stays the only system for registration and check-in. The SCAI web page does just three things: the interest form, the number tag and the contact-sharing QR.</span></p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection id="outputs" title="Outputs" index="05" contentClass="text-muted-foreground leading-relaxed">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/60">
                  {["Output", "For", "What it shows"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-[600] text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["SCAI score",        "Each attendee",    "Score out of 100, pillar breakdown and suggested next steps"],
                  ["Persona",           "Each attendee",    "Connector, Contributor, Seeker or Observer"],
                  ["Group comparison",  "Organizers",       "Average SCAI and match rate per interest group"],
                  ["Unmatched needs",   "Organizers",       "Attendees whose intent was not met, such as job seekers who met no hirer"],
                  ["Event report",      "Organizers, sponsors", "Match rate, cross-discipline connections, NPS and outcomes at 90 days"],
                ].map(([out, forWho, what], i) => (
                  <tr key={i} className="border-t border-border/50">
                    <td className="px-4 py-2.5 font-[500] text-foreground whitespace-nowrap">{out}</td>
                    <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{forWho}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{what}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>

        <CollapsibleSection id="deployment-privacy" title="Deployment, timeline and Privacy" index="06" contentClass="text-muted-foreground leading-relaxed">
          <div className="space-y-6">

            {/* Deployment timeline */}
            <div>
              <h3 className="text-sm font-[600] text-foreground mb-2">Deployment timeline</h3>
              <p>The tool can be ready for the next Connect in about 4 weeks.</p>
              <Diagram2 />
            </div>

            <div className="border-t border-border/50" />

            {/* Privacy and consent */}
            <div>
              <h3 className="text-sm font-[600] text-foreground mb-2">Privacy and consent</h3>
              <p>SCAI handles personal data, so it is designed to follow the Nigeria Data Protection Act 2023.</p>
              <ul className="space-y-2 mt-2">
                {[
                  "<strong>Opt-in consent</strong> at registration, with a plain-language note on what is collected and why.",
                  "<strong>Collect only what is needed:</strong> name, interest group, intent, connections and follow-up answers.",
                  "<strong>Scores are private.</strong> Each attendee sees only their own score. No public leaderboard.",
                  "<strong>Organizers see summaries first.</strong> Individual data visible only to named organizers.",
                  "<strong>Retention limit:</strong> raw data deleted or anonymized 6 months after the event.",
                  "<strong>Right to withdraw:</strong> anyone can ask to see or delete their data at any time.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-foreground leading-relaxed">
                    <span className="text-accent mt-1 flex-shrink-0 text-xs">▸</span>
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </CollapsibleSection>

        {/* ── Prototype sections ────────────────────────── */}

        <CollapsibleSection id="additional-info" title="Additional info" index="07">
          <div className="space-y-6">

            {/* What an attendee sees */}
            <div>
              <h3 className="text-sm font-[600] text-foreground mb-2">What an attendee sees</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Each attendee sees only their own score, their persona and a pillar breakdown. The
                next-steps screen nudges them to follow up. In this example:
              </p>
              <div className="formula-block mt-3">
                0.10 × 90 + 0.15 × 60 + 0.25 × 85 + 0.30 × 80 + 0.20 × 70 = <strong className="text-accent">77</strong>
              </div>
              <div className="mt-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/prototype/attendee">
                    Try the attendee view <Icon icon="solar:arrow-right-linear" className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="border-t border-border/50" />

            {/* The scoreboard */}
            <div>
              <h3 className="text-sm font-[600] text-foreground mb-2">The scoreboard</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Only organizers see this view. The KPI row shows event health at a glance. The table
                ranks attendees, and each name opens their full pillar breakdown. The unmatched needs panel
                tells organizers who to introduce to whom before the 7-day check-in.
              </p>
              <div className="mt-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/prototype/organizer">
                    Try the organizer scoreboard <Icon icon="solar:arrow-right-linear" className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="border-t border-border/50" />

            {/* Data model */}
            <div>
              <h3 className="text-sm font-[600] text-foreground mb-2">Data model</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">The SCAI score is recalculated each time new data arrives.</p>
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
            </div>

          </div>
        </CollapsibleSection>
        </div>
        </AccordionGroup>
      </div>
    </TabLayout>
  );
}


const DATA_CAPTURE_GROUPS = [
  { pillar: "P: Presence", rows: [
    { metric: "Check-in time",    how: "Staff scan the Luma ticket at the door",                              when: "Arrival",         tool: "Luma" },
    { metric: "Segments attended",how: "A short code shown on screen at the start of each segment",           when: "Start of segment", tool: "SCAI page" },
    { metric: "Stayed to close",  how: "The usher logs the number tag when serving refreshments",             when: "Refreshments",    tool: "Usher form" },
  ]},
  { pillar: "E: Engagement", rows: [
    { metric: "Questions asked",      how: "Attendees say their tag before asking; note-taker types it",     when: "Keynote + Panel", tool: "Note-taker" },
    { metric: "Question quality (1–3)",how: "The note-taker scores each question as it is logged",           when: "Keynote + Panel", tool: "Note-taker" },
    { metric: "Takeaways",            how: "A prompt on the tag page after the panel",                       when: "After panel",     tool: "SCAI page" },
  ]},
  { pillar: "N: Networking", rows: [
    { metric: "Contacts confirmed", how: "Scan each other's tag QR; both confirm",                                             when: "Networking", tool: "SCAI page" },
    { metric: "Group photo",        how: "Moderator announces photo time; pop-up asks each member to confirm",                 when: "Networking", tool: "SCAI page" },
    { metric: "Cross-discipline",   how: "Calculated from confirmed contacts and each person's group",                         when: "Automatic",  tool: "SCAI page" },
  ]},
  { pillar: "M: Matching", rows: [
    { metric: "Intent card filled",      how: "Interest form on the tag page",                                when: "Claiming a tag", tool: "SCAI page" },
    { metric: "Matches in networking",   how: "The page flags matching intents when two people scan",         when: "Networking",     tool: "SCAI page" },
    { metric: "Matches in breakouts",    how: "Same scan and confirm in breakout segment",                    when: "Breakouts",      tool: "SCAI page" },
  ]},
  { pillar: "F: Follow-through", rows: [
    { metric: "Follow-ups sent", how: "Check-in survey sent to the Luma email", when: "Days 7, 30, 90", tool: "Email survey" },
    { metric: "Meetings held",   how: "Same survey",                            when: "Day 30",         tool: "Email survey" },
    { metric: "Outcomes",        how: "Same survey",                            when: "Days 30 and 90", tool: "Email survey" },
  ]},
  { pillar: "Event level", rows: [
    { metric: "NPS (0–10)", how: "One question in the 7-day survey", when: "Day 7", tool: "Email survey" },
  ]},
];

const HOW_TO_USE = [
  "<strong class='text-foreground'>Before the event:</strong> attendees register on Luma as usual. Luma issues each person a ticket with a QR code.",
  "<strong class='text-foreground'>At the door:</strong> staff scan the Luma ticket, which records the check-in in Luma.",
  "<strong class='text-foreground'>Claim a tag:</strong> the attendee scans a QR poster at the desk. The SCAI web page confirms the check-in and assigns a number tag such as 1D.",
  "<strong class='text-foreground'>Start of each segment:</strong> a short code appears on screen. Attendees enter it on their tag page.",
  "<strong class='text-foreground'>During sessions:</strong> attendees open with their name and tag. A note-taker types the tag and scores the question 1 to 3.",
  "<strong class='text-foreground'>Numbered networking:</strong> everyone with the same number meets. They scan each other's tag QR to log contacts.",
  "<strong class='text-foreground'>Breakouts:</strong> the page suggests matches by intent. When two people with matching intents meet, they scan and confirm.",
  "<strong class='text-foreground'>Refreshments:</strong> the usher logs each person's tag, recording who stayed to the end.",
  "<strong class='text-foreground'>After the event:</strong> check-in surveys go to the Luma email at 7, 30 and 90 days.",
  "<strong class='text-foreground'>Review:</strong> organizers open the scoreboard, see each SCAI score and export the event report.",
];

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
