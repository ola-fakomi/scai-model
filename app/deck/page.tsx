import { generateSeed } from "@/lib/seed";
import { scoreAll, computeKPIs } from "@/lib/scoring";

export default function DeckPage() {
  // Generate data server-side for the deck
  const state = generateSeed();
  const scores = scoreAll(state);
  const kpis = computeKPIs(state, scores);

  const slides = [
    <Slide1 key={1} />,
    <Slide2 key={2} />,
    <Slide3 key={3} />,
    <Slide4 key={4} />,
    <Slide5 key={5} />,
    <Slide6 key={6} />,
    <Slide7 key={7} />,
    <Slide8 key={8} />,
    <Slide9 key={9} kpis={kpis} />,
    <Slide10 key={10} />,
  ];

  return (
    <div className="bg-gray-200 p-4 space-y-4">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="relative bg-white w-[1920px] h-[1080px] overflow-hidden shadow-lg flex-shrink-0"
          style={{ pageBreakAfter: "always" }}
        >
          {slide}
          <footer className="absolute bottom-0 left-0 right-0 h-10 flex items-center justify-between px-12 border-t border-gray-100">
            <span className="text-xs text-gray-400">SCAI · CCI STEM Connect</span>
            <span className="text-xs text-gray-400">{i + 1} / 10</span>
          </footer>
        </div>
      ))}
    </div>
  );
}

function SlideBase({
  children,
  bg = "white",
  accent = false,
}: {
  children: React.ReactNode;
  bg?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`w-full h-full flex flex-col ${
        accent ? "bg-[#1F5FBF] text-white" : "bg-white text-gray-900"
      }`}
    >
      {children}
    </div>
  );
}

function Slide1() {
  return (
    <SlideBase accent>
      <div className="flex-1 flex flex-col items-center justify-center px-32 text-center">
        <div className="text-8xl font-black tracking-tight mb-6">SCAI</div>
        <h1 className="text-5xl font-bold mb-4 leading-tight">
          SCAI turns a networking event<br />into measurable outcomes
        </h1>
        <p className="text-2xl text-blue-200 mb-2">
          STEM Connect Attendee Index
        </p>
        <p className="text-xl text-blue-200 mb-8">
          Submission for Technical Assistant to the CTO, Payaza Africa
        </p>
        <div className="flex items-center gap-6 text-blue-100">
          <span className="text-lg">Ola Fakomi</span>
          <span>·</span>
          <span className="text-lg">24 November 2026</span>
        </div>
      </div>
    </SlideBase>
  );
}

function Slide2() {
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col px-24 py-20">
        <div className="text-[#1F5FBF] font-bold text-xl mb-4">Slide 2 — The problem</div>
        <h2 className="text-6xl font-bold text-gray-900 leading-tight mb-10">
          "Performance" was never defined,<br />
          and most event value leaves no record
        </h2>
        <div className="grid grid-cols-3 gap-8 flex-1">
          {[
            { icon: "📋", title: "Undefined brief", text: "The CTO asked for a performance model but left \"performance\" undefined." },
            { icon: "📱", title: "Data trapped on phones", text: "Conversations, contacts and photos stay on personal devices. No aggregation happens." },
            { icon: "🃏", title: "Intent cards pile up", text: "Paper cards stating hiring, job-seeking and investment intentions are never analysed." },
          ].map((c) => (
            <div key={c.title} className="bg-gray-50 rounded-2xl p-8">
              <div className="text-5xl mb-4">{c.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{c.title}</h3>
              <p className="text-xl text-gray-600 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  );
}

function Slide3() {
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col px-24 py-20">
        <div className="text-[#1F5FBF] font-bold text-xl mb-4">Slide 3 — Seven dimensions</div>
        <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-10">
          Performance can mean seven things, so SCAI<br />combines them into five pillars
        </h2>
        <div className="flex gap-8 items-center flex-1">
          <div className="grid grid-cols-2 gap-4 w-1/2">
            {["Participation", "Networking reach", "Intent matching", "Learning & reflection", "Follow-through", "Group performance", "Event performance"].map((item, i) => (
              <div key={item} className={`bg-gray-50 rounded-xl px-5 py-3 text-lg font-medium text-gray-700 ${i === 6 ? "col-span-2 text-center" : ""}`}>
                {item}
              </div>
            ))}
          </div>
          <div className="text-5xl text-[#1F5FBF] font-bold">→</div>
          <div className="flex flex-col gap-3 w-1/3">
            {["P: Presence · 10%", "E: Engagement · 15%", "N: Networking · 25%", "M: Matching · 30% ★", "F: Follow-through · 20%"].map((p, i) => (
              <div key={p} className={`rounded-xl px-5 py-3 text-lg font-semibold ${i === 3 ? "bg-amber-100 text-amber-800 border-2 border-amber-400" : "bg-[#EEF3FB] text-[#1F5FBF]"}`}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideBase>
  );
}

function Slide4() {
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col px-24 py-16">
        <div className="text-[#1F5FBF] font-bold text-xl mb-4">Slide 4 — The formula</div>
        <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          One score out of 100, weighted towards<br />finding the right match
        </h2>
        <div className="bg-[#EEF3FB] border-l-8 border-[#1F5FBF] rounded-r-2xl px-10 py-8 text-5xl font-bold text-[#163F80] mb-10">
          SCAI = 0.10P + 0.15E + 0.25N + <span className="text-amber-600">0.30M</span> + 0.20F
        </div>
        <div className="grid grid-cols-5 gap-4 flex-1">
          {[
            { k: "P", label: "Presence", w: "10%", desc: "Checked in, segments attended, stayed to close" },
            { k: "E", label: "Engagement", w: "15%", desc: "Questions asked & scored, takeaway submitted" },
            { k: "N", label: "Networking", w: "25%", desc: "Confirmed contacts, group photo, cross-discipline" },
            { k: "M", label: "Matching", w: "30%", desc: "Intent card complete, matched with the right person", highlight: true },
            { k: "F", label: "Follow-through", w: "20%", desc: "Follow-ups, meetings, outcomes at 7-30-90 days" },
          ].map((p) => (
            <div key={p.k} className={`rounded-xl p-5 ${p.highlight ? "bg-amber-50 border-2 border-amber-400" : "bg-gray-50"}`}>
              <div className={`text-3xl font-black mb-1 ${p.highlight ? "text-amber-700" : "text-[#1F5FBF]"}`}>{p.k}</div>
              <div className="font-bold text-lg mb-1">{p.label}</div>
              <div className={`text-sm font-semibold mb-2 ${p.highlight ? "text-amber-600" : "text-[#1F5FBF]"}`}>{p.w}</div>
              <div className="text-sm text-gray-600">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  );
}

function Slide5() {
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col px-24 py-16">
        <div className="text-[#1F5FBF] font-bold text-xl mb-4">Slide 5 — Design choices</div>
        <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-10">
          The model rewards quality, not noise
        </h2>
        <div className="grid grid-cols-2 gap-8 flex-1">
          {[
            { title: "Compared within the cohort", text: "Scores are percentile ranks, so the model reflects relative performance regardless of group size." },
            { title: "Diminishing returns (log scale)", text: "Tunde made 30 connections, Ada made 6. His score (4.4) is less than 2× hers (2.8) — quality beats volume." },
            { title: "Both people must confirm", text: "A connection only counts when both sides log it, preventing self-reporting inflation." },
            { title: "Outcomes over activity", text: "A quiet attendee who found their match scores well. Introverts are not penalised for depth over breadth." },
          ].map((c) => (
            <div key={c.title} className="border-l-4 border-[#1F5FBF] pl-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{c.title}</h3>
              <p className="text-xl text-gray-600 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  );
}

function Slide6() {
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col px-24 py-16">
        <div className="text-[#1F5FBF] font-bold text-xl mb-4">Slide 6 — Event day flow</div>
        <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-10">
          Event day runs on Luma and a number tag,<br />with no new hardware
        </h2>
        <div className="flex gap-3 items-stretch flex-1">
          {[
            { step: "1", label: "Luma check-in", desc: "Staff scan the ticket at the door" },
            { step: "2", label: "Claim a tag", desc: "Scan the desk QR → fill form → get e.g. 1D" },
            { step: "3", label: "Segment codes", desc: "Enter the code shown on screen at each segment" },
            { step: "4", label: "Questions", desc: `"Hi, I'm Ola, 1D…" — note-taker logs & scores` },
            { step: "5", label: "Scan & confirm", desc: "Mutual QR scan to log confirmed contacts" },
            { step: "6", label: "Group photo", desc: "Moderator triggers; pop-up confirms each member" },
            { step: "7", label: "Refreshments", desc: "Usher logs tag → records who stayed to close" },
          ].map((s, i) => (
            <div key={s.step} className="flex items-stretch gap-3 flex-1">
              <div className="bg-[#EEF3FB] rounded-xl p-5 flex flex-col items-center justify-start flex-1">
                <div className="w-10 h-10 rounded-full bg-[#1F5FBF] text-white text-lg font-bold flex items-center justify-center mb-3">
                  {s.step}
                </div>
                <h3 className="font-bold text-base text-center mb-2">{s.label}</h3>
                <p className="text-sm text-gray-600 text-center leading-snug">{s.desc}</p>
              </div>
              {i < 6 && <div className="flex items-center text-[#1F5FBF] text-2xl font-bold">→</div>}
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  );
}

function Slide7() {
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col px-24 py-16">
        <div className="text-[#1F5FBF] font-bold text-xl mb-4">Slide 7 — Data capture</div>
        <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-8">
          Every metric has a capture point,<br />all at almost no cost
        </h2>
        <div className="grid grid-cols-5 gap-4 flex-1">
          {[
            { seg: "Arrival", metrics: ["Check-in time"], tool: "Luma" },
            { seg: "Segments", metrics: ["Segments attended", "Stayed to close"], tool: "SCAI page" },
            { seg: "Sessions", metrics: ["Questions asked", "Question quality", "Takeaway text"], tool: "Note-taker form" },
            { seg: "Networking", metrics: ["Confirmed contacts", "Group photo", "Intent matches", "Cross-discipline"], tool: "SCAI page" },
            { seg: "Post-event", metrics: ["Follow-ups sent", "Meetings held", "Outcomes", "NPS"], tool: "Email survey" },
          ].map((col) => (
            <div key={col.seg} className="bg-gray-50 rounded-xl p-5">
              <h3 className="font-bold text-lg text-[#1F5FBF] mb-1">{col.seg}</h3>
              <div className="text-xs text-gray-500 mb-3">{col.tool}</div>
              {col.metrics.map((m) => (
                <div key={m} className="bg-white rounded-lg px-3 py-2 mb-1.5 text-sm font-medium text-gray-700 border border-gray-100">
                  {m}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  );
}

function Slide8() {
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col px-24 py-16">
        <div className="text-[#1F5FBF] font-bold text-xl mb-4">Slide 8 — The app</div>
        <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-8">
          Attendees see their own score;<br />organizers see the whole event
        </h2>
        <div className="flex gap-8 flex-1">
          <div className="flex flex-col items-center gap-4 flex-1">
            <div className="bg-gray-100 border border-gray-200 rounded-2xl w-56 aspect-[9/16] overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/screens/tag-page.png" alt="Tag page" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm text-gray-600">Attendee tag page</span>
          </div>
          <div className="flex flex-col items-center gap-4 flex-1">
            <div className="bg-gray-100 border border-gray-200 rounded-2xl w-56 aspect-[9/16] overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/screens/score-screen.png" alt="Score screen" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm text-gray-600">Score & persona</span>
          </div>
          <div className="flex flex-col items-center gap-4 flex-2">
            <div className="bg-gray-100 border border-gray-200 rounded-2xl flex-1 w-full overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/screens/organizer-dashboard.png" alt="Organizer dashboard" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm text-gray-600">Organizer scoreboard</span>
          </div>
        </div>
      </div>
    </SlideBase>
  );
}

function Slide9({ kpis }: { kpis: ReturnType<typeof computeKPIs> }) {
  return (
    <SlideBase>
      <div className="flex-1 flex flex-col px-24 py-16">
        <div className="text-[#1F5FBF] font-bold text-xl mb-4">Slide 9 — Outputs</div>
        <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-10">
          Organizers learn exactly who to introduce,<br />and what to fix next time
        </h2>
        <div className="grid grid-cols-3 gap-8 flex-1">
          {[
            {
              who: "Attendees",
              color: "#1F5FBF",
              items: [
                "Score out of 100",
                "Persona chip (Connector / Contributor / Seeker / Observer)",
                "Pillar breakdown bars",
                "Top 3 follow-up suggestions",
                "Download contacts (.vcf)",
              ],
            },
            {
              who: "Organizers",
              color: "#10b981",
              items: [
                `Match rate: ${Math.round(kpis.match_rate * 100)}%`,
                `Cross-group links: ${Math.round(kpis.cross_group_links * 100)}%`,
                `Average SCAI: ${kpis.avg_scai}`,
                "Unmatched needs panel",
                "Bridgers (top 5 by betweenness centrality)",
              ],
            },
            {
              who: "Sponsors",
              color: "#8b5cf6",
              items: [
                "NPS score",
                "Outcomes at 90 days (hires, deals, partnerships)",
                "SCAI by interest group",
                "Event report CSV",
                "Anonymized aggregate data",
              ],
            },
          ].map((col) => (
            <div key={col.who} className="bg-gray-50 rounded-2xl p-8">
              <h3
                className="text-2xl font-bold mb-5"
                style={{ color: col.color }}
              >
                {col.who}
              </h3>
              {col.items.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-2 mb-3"
                >
                  <span
                    className="mt-1 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: col.color }}
                  />
                  <span className="text-lg text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  );
}

function Slide10() {
  return (
    <SlideBase accent>
      <div className="flex-1 flex flex-col px-32 py-20 items-center justify-center text-center">
        <h2 className="text-6xl font-bold mb-6 leading-tight">
          Ready to pilot at the next Connect<br />in about 4 weeks
        </h2>
        <div className="flex gap-6 mb-10 text-left">
          {[
            { label: "Weeks 1–3", text: "Build + pilot" },
            { label: "Week 4", text: "Pre-event" },
            { label: "Day 0", text: "Event", highlight: true },
            { label: "Days 7–90", text: "Follow-up" },
            { label: "Day 90+", text: "Review" },
          ].map((p, i) => (
            <div
              key={p.label}
              className={`rounded-xl px-5 py-3 text-center ${
                p.highlight
                  ? "bg-white text-[#1F5FBF] font-bold"
                  : "bg-blue-700/50 text-white"
              }`}
            >
              <div className="font-bold text-sm">{p.label}</div>
              <div className="text-xs mt-0.5">{p.text}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-8 text-blue-200 text-lg mb-10">
          <span>✓ Opt-in consent (NDPA 2023)</span>
          <span>✓ Private scores</span>
          <span>✓ 6-month data retention</span>
        </div>
        <p className="text-3xl font-semibold text-white mb-2">
          Let's pilot SCAI at the next CCI STEM Connect.
        </p>
        <p className="text-blue-200 text-xl">Ola Fakomi · ola.fakomi@example.com</p>
      </div>
    </SlideBase>
  );
}
