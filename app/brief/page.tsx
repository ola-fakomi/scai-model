import TabLayout from "@/components/TabLayout";
import CollapsibleSection from "@/components/CollapsibleSection";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Brief – SCAI Case Study" };

export default function BriefPage() {
  return (
    <TabLayout>
      <div className="space-y-12 animate-enter">

        {/* Hero */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">Case Study</Badge>
            <Badge variant="muted">CCI STEM Connect · Nov 2026</Badge>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-foreground leading-tight">
            CCI STEM Connect<br />Case Study: The SCAI Model
          </h1>
          <p className="text-muted-foreground text-sm">Ola Fakomi · 24 November 2026</p>
        </div>

        <Separator className="bg-border" />

        {/* Summary */}
        <div className="border border-accent/30 rounded-lg bg-accent/5 p-5">
          <p className="text-sm text-foreground leading-relaxed">
            <span className="text-accent font-[600]">SCAI</span> (STEM Connect Attendee Index) is a scoring
            model, deployment plan and working prototype that together turn a networking event into measurable
            outcomes. Each attendee receives a score from 0–100 across five weighted pillars —{" "}
            <span className="text-foreground font-[500]">Presence, Engagement, Networking, Matching</span> and{" "}
            <span className="text-foreground font-[500]">Follow-through</span> — with Matching carrying the most
            weight at 30%.
          </p>
        </div>

        <CollapsibleSection id="goal" title="Goal" index="01">
          <p className="text-foreground leading-relaxed">
            At CCI STEM Connect, the CTO of Payaza Africa asked attendees to build a model that
            calculates the performance of the event's attendees.
          </p>
          <p className="text-foreground leading-relaxed">
            This case study answers with SCAI, the STEM Connect Attendee Index. It is a scoring
            model, a deployment plan and a working prototype that together turn a networking event
            into measurable outcomes.
          </p>
        </CollapsibleSection>

        <CollapsibleSection id="problem" title="Problem" index="02">
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {[
              { icon: "📋", title: "Undefined brief", text: "The brief never defines \"performance\" — attendance? contacts? deals?" },
              { icon: "📱", title: "Data trapped on phones", text: "Conversations, contacts and photos stay on personal devices." },
              { icon: "🃏", title: "Intent cards pile up", text: "Paper cards stating hiring or investment intent are never analysed." },
            ].map((c) => (
              <Card key={c.title}>
                <CardContent className="pt-4">
                  <div className="text-xl mb-2">{c.icon}</div>
                  <h3 className="font-[500] text-sm text-foreground mb-1">{c.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-foreground leading-relaxed">
            Nobody can comprehensively tell who got value from the event, or whether the event
            itself delivered.
          </p>
        </CollapsibleSection>

        <CollapsibleSection id="methodology" title="Methodology" index="03">
          <ol className="space-y-3">
            {[
              { head: "Map the event.", body: "Break it into its four segments: keynote, panel, numbered networking and interest-group breakouts (Science, Technology, Engineering, Math)." },
              { head: "Define performance seven ways.", body: "Participation, networking reach, intent matching, learning, follow-through, group performance and the event's own performance." },
              { head: "Combine them into one index.", body: "Group the seven readings into five weighted pillars, each tied to a segment and a data source." },
              { head: "Test it.", body: "Run the model on a sample dataset of about 200 attendees built from the event's real structure from 22 November 2026." },
              { head: "Make it collectable.", body: "Design a lightweight tool so the next event captures the data automatically." },
            ].map((step, i) => (
              <li key={i} className="flex gap-3 animate-enter" style={{ animationDelay: `${i * 0.06}s` }}>
                <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent border border-accent/25 text-xs font-[600] flex items-center justify-center tabular-nums">
                  {i + 1}
                </span>
                <span className="text-foreground leading-relaxed text-sm">
                  <strong className="text-foreground">{step.head}</strong> {step.body}
                </span>
              </li>
            ))}
          </ol>
        </CollapsibleSection>

        <CollapsibleSection id="assumptions" title="Assumptions" index="04">
          <ul className="space-y-2">
            {[
              "Performance is relative. Attendees are compared with each other, not against a fixed bar.",
              "The intent cards (job seeking, hiring, partner, capital) state why each person came. Finding that match is the most important outcome.",
              "Quality beats quantity. A few real connections are worth more than many quick hellos.",
              "Value continues after the event, so follow-through is measured at 7, 30 and 90 days.",
              "Attendees will share data if they consent and get something useful back.",
            ].map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground leading-relaxed">
                <span className="text-accent mt-1 flex-shrink-0 text-xs">▸</span>
                {item}
              </li>
            ))}
          </ul>
        </CollapsibleSection>

        <CollapsibleSection id="solution" title="Solution" index="05">
          <p className="text-foreground leading-relaxed text-sm">
            SCAI scores each attendee from 0 to 100 across five pillars. Matching carries the most
            weight at 30% because the intent cards say what each person came for.
          </p>
          <div className="formula-block mt-4">
            SCAI = 0.10P + 0.15E + 0.25N + <span className="text-accent">0.30M</span> + 0.20F
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The same data rolls up into event KPIs such as match rate and cross-discipline
            connections. Data comes from Luma ticket scans at the door and a number tag (such as 1D)
            given only to attendees who check in.
          </p>
        </CollapsibleSection>

        <CollapsibleSection id="limitations" title="Limitations" index="06">
          <ul className="space-y-3">
            {[
              { head: "No data from the past event.", body: "The model is tested on sample data. A short retroactive survey could provide some real data." },
              { head: "Self-reporting bias.", body: "Requiring both people to confirm, or a photo, reduces this." },
              { head: "Quality is judged by people.", body: "Scoring a question from 1 to 3 depends on the moderator's judgment." },
              { head: "Weights are a starting point.", body: "They should be tuned with organizers after the first real event." },
              { head: "Late outcomes are hard to trace.", body: "A hire or deal may happen months later and go unreported." },
            ].map((item, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-muted-foreground mt-1 flex-shrink-0 text-xs">—</span>
                <span className="text-foreground leading-relaxed">
                  <strong className="text-muted-foreground font-[500]">{item.head}</strong>{" "}
                  <span className="text-muted-foreground">{item.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      </div>
    </TabLayout>
  );
}

