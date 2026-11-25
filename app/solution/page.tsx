import TabLayout from "@/components/TabLayout";
import CollapsibleSection from "@/components/CollapsibleSection";
import Diagram1 from "@/components/Diagram1";
import Diagram2 from "@/components/Diagram2";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata = { title: "Solution – SCAI Case Study" };

export default function SolutionPage() {
  return (
    <TabLayout>
      <div className="space-y-12 animate-enter">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground leading-tight">
            Solution: The SCAI Model
          </h1>
        </div>

        <CollapsibleSection id="overview" title="Overview" index="01" contentClass="text-muted-foreground leading-relaxed">
          <p>
            The STEM Connect Attendee Index (SCAI) gives every attendee one score from 0 to 100.
            The score shows how much value they created and received at the event.
          </p>
          <p>
            It combines what happened in each segment of the event with what happened afterwards.
            Organizers use it to see who engaged, who found what they came for, and where the event fell short.
          </p>
        </CollapsibleSection>

        <CollapsibleSection id="how-it-works" title="How it works" index="02" contentClass="text-muted-foreground leading-relaxed">
          <p>
            Each part of the event produces one kind of data, which feeds one pillar.
            The five weighted pillars add up to the attendee's SCAI score. Matching carries the most
            weight because the intent cards say what each person came for.
          </p>
          <Diagram1 />
        </CollapsibleSection>

        <CollapsibleSection id="pillars" title="Pillars, weights and formula" index="03" contentClass="text-muted-foreground leading-relaxed">
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/60">
                  {["Pillar", "What it measures", "Event segment", "Weight"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left text-[11px] font-[600] text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["P: Presence",      "Check-in time, segments attended, stayed to close",                              "Whole event",       "10%",   false],
                  ["E: Engagement",    "Questions asked (scored 1–3 for quality), keynote and panel takeaways",          "Keynote + Panel",   "15%",   false],
                  ["N: Networking",    "Contacts confirmed by both people, group photo confirmed, cross-discipline",      "Numbered networking","25%",  false],
                  ["M: Matching",      "Intent card filled completely, relevant matches found",                           "Breakouts",         "30% ★", true],
                  ["F: Follow-through","Follow-ups sent, meetings held, outcomes reported at 30 days",                   "After the event",   "20%",   false],
                ].map(([pillar, what, segment, weight, highlight], i) => (
                  <tr key={i} className={cn("border-t border-border/50 transition-colors", highlight && "bg-accent/5")}>
                    <td className={cn("px-4 py-3 font-[500] whitespace-nowrap text-sm", highlight ? "text-accent" : "text-foreground")}>{pillar}</td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">{what}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-sm">{segment}</td>
                    <td className={cn("px-4 py-3 font-[600] whitespace-nowrap text-sm tabular-nums", highlight ? "text-accent" : "text-foreground")}>
                      {weight}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="formula-block">
            SCAI = 0.10P + 0.15E + 0.25N + <span className="text-accent">0.30M</span> + 0.20F
          </div>
          <p className="text-muted-foreground">
            Each pillar is scored from 0 to 100 before weighting, so the final SCAI is also out of 100.
          </p>
        </CollapsibleSection>

        <CollapsibleSection id="data-capture" title="Data capture map" index="04" contentClass="text-muted-foreground leading-relaxed">
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
                {DATA_CAPTURE_MAP.map(([pillar, metric, how, when, tool], i) => (
                  <tr key={i} className="border-t border-border/50">
                    <td className="px-3 py-2.5 font-[500] text-foreground whitespace-nowrap text-xs">{pillar}</td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">{metric}</td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">{how}</td>
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap text-xs">{when}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <Badge variant="secondary" className="font-[400] text-[10px]">{tool}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong className="text-foreground">Note:</strong> An attendee who stayed but skipped refreshments counts as "unknown" for Stayed to close.</p>
            <p>Surveys go to the Luma email because the tag expires at midnight on event day.</p>
          </div>
        </CollapsibleSection>

        <CollapsibleSection id="design-choices" title="Design choices" index="05" contentClass="text-muted-foreground leading-relaxed">
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

        <CollapsibleSection id="how-to-use" title="How to use it" index="06" contentClass="text-muted-foreground leading-relaxed">
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

        <CollapsibleSection id="outputs" title="Outputs" index="07" contentClass="text-muted-foreground leading-relaxed">
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

        <CollapsibleSection id="privacy" title="Privacy and consent" index="08" contentClass="text-muted-foreground leading-relaxed">
          <p>SCAI handles personal data, so it is designed to follow the Nigeria Data Protection Act 2023.</p>
          <ul className="space-y-2">
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
        </CollapsibleSection>

        <CollapsibleSection id="deployment" title="Deployment timeline" index="09" contentClass="text-muted-foreground leading-relaxed">
          <p>The tool can be ready for the next Connect in about 4 weeks.</p>
          <Diagram2 />
        </CollapsibleSection>
      </div>
    </TabLayout>
  );
}


const DATA_CAPTURE_MAP = [
  ["P: Presence", "Check-in time", "Staff scan the Luma ticket at the door", "Arrival", "Luma"],
  ["P: Presence", "Segments attended", "A short code shown on screen at the start of each segment", "Start of segment", "SCAI page"],
  ["P: Presence", "Stayed to close", "The usher logs the number tag when serving refreshments", "Refreshments", "Usher form"],
  ["E: Engagement", "Questions asked", "Attendees say their tag before asking; note-taker types it", "Keynote + Panel", "Note-taker"],
  ["E: Engagement", "Question quality (1–3)", "The note-taker scores each question as it is logged", "Keynote + Panel", "Note-taker"],
  ["E: Engagement", "Takeaways", "A prompt on the tag page after the panel", "After panel", "SCAI page"],
  ["N: Networking", "Contacts confirmed", "Scan each other's tag QR; both confirm", "Networking", "SCAI page"],
  ["N: Networking", "Group photo", "Moderator announces photo time; pop-up asks each member to confirm", "Networking", "SCAI page"],
  ["N: Networking", "Cross-discipline", "Calculated from confirmed contacts and each person's group", "Automatic", "SCAI page"],
  ["M: Matching", "Intent card filled", "Interest form on the tag page", "Claiming a tag", "SCAI page"],
  ["M: Matching", "Matches in networking", "The page flags matching intents when two people scan", "Networking", "SCAI page"],
  ["M: Matching", "Matches in breakouts", "Same scan and confirm in breakout segment", "Breakouts", "SCAI page"],
  ["F: Follow-through", "Follow-ups sent", "Check-in survey sent to the Luma email", "Days 7, 30, 90", "Email survey"],
  ["F: Follow-through", "Meetings held", "Same survey", "Day 30", "Email survey"],
  ["F: Follow-through", "Outcomes", "Same survey", "Days 30 and 90", "Email survey"],
  ["Event level", "NPS (0–10)", "One question in the 7-day survey", "Day 7", "Email survey"],
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
