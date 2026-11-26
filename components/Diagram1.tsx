export default function Diagram1() {
  const rows = [
    { source: "Whole event · Luma ticket scans",           pillar: "P: Presence",      weight: "10%", highlight: false },
    { source: "Keynote + Panel · Questions by number tag", pillar: "E: Engagement",    weight: "15%", highlight: false },
    { source: "Numbered networking · Tag scans, photos",   pillar: "N: Networking",    weight: "25%", highlight: false },
    { source: "Breakouts · Intent cards, matches",         pillar: "M: Matching",      weight: "30%", highlight: true  },
    { source: "After the event · 7, 30, 90-day check-ins", pillar: "F: Follow-through",weight: "20%", highlight: false },
  ];

  return (
    <div className="my-6">
<div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_28px_1fr] bg-secondary/60 px-4 py-2 border-b border-border">
          <span className="text-[11px] font-[600] text-muted-foreground uppercase tracking-wider">Event segment & data source</span>
          <span />
          <span className="text-[11px] font-[600] text-muted-foreground uppercase tracking-wider">Pillar & weight</span>
        </div>
        {rows.map((r, i) => (
          <div
            key={i}
            className={`grid grid-cols-[1fr_28px_1fr] items-center px-4 py-3 border-t border-border/50 transition-colors ${r.highlight ? "bg-accent/5" : ""}`}
          >
            <span className="text-sm text-muted-foreground">{r.source}</span>
            <span className="text-muted-foreground font-[500] text-center">→</span>
            <span className={`text-sm font-[500] flex items-center gap-2 ${r.highlight ? "text-accent" : "text-foreground"}`}>
              {r.pillar}
              <span className={`text-[10px] font-[600] px-1.5 py-0.5 rounded tabular-nums ${
                r.highlight ? "bg-accent/15 text-accent border border-accent/25" : "bg-secondary text-muted-foreground border border-border"
              }`}>
                {r.weight}
              </span>
              {r.highlight && <span className="text-[10px] text-accent/70">★ largest</span>}
            </span>
          </div>
        ))}
        <div className="bg-foreground px-4 py-3 text-center">
          <span className="text-background font-[600] text-sm tracking-wide">
            SCAI score · 0 to 100 · per attendee
          </span>
        </div>
      </div>
      <div className="formula-block mt-4">
        SCAI = 0.10P + 0.15E + 0.25N + <span className="text-accent">0.30M</span> + 0.20F
      </div>
    </div>
  );
}
