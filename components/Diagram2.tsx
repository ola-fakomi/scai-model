export default function Diagram2() {
  const phases = [
    { title: "Build & test",  when: "Weeks 1–3",     items: ["Build web app", "Pilot 10 volunteers"],            highlight: false },
    { title: "Pre-event",     when: "Week 4",         items: ["Luma registration", "QR posters", "Link tested"],  highlight: false },
    { title: "Event day",     when: "Day 0",          items: ["Tags assigned", "Questions", "Scans", "Matches"],  highlight: true  },
    { title: "Follow-up",     when: "Days 7, 30, 90", items: ["Check-in surveys", "Outcomes logged"],            highlight: false },
    { title: "Review",        when: "After day 90",   items: ["Event report", "Tune weights"],                   highlight: false },
  ];

  return (
    <div className="my-6">
      <p className="text-[11px] font-[600] text-muted-foreground uppercase tracking-widest mb-3">
        From build to final review: about 4 weeks, then 90 days
      </p>

      {/* Desktop */}
      <div className="hidden sm:flex items-stretch gap-0">
        {phases.map((p, i) => (
          <div key={i} className="flex items-stretch flex-1">
            <div className={`flex-1 rounded-lg border p-3 ${
              p.highlight
                ? "bg-accent/10 border-accent/40"
                : "bg-card border-border"
            }`}>
              <div className={`font-[500] text-sm ${p.highlight ? "text-accent" : "text-foreground"}`}>{p.title}</div>
              <div className={`text-[11px] mb-2 ${p.highlight ? "text-accent/60" : "text-muted-foreground"}`}>{p.when}</div>
              <ul className="space-y-0.5">
                {p.items.map((item, j) => (
                  <li key={j} className={`text-[11px] ${p.highlight ? "text-accent/80" : "text-muted-foreground"}`}>
                    · {item}
                  </li>
                ))}
              </ul>
            </div>
            {i < phases.length - 1 && (
              <div className="flex items-center px-1 mt-3">
                <span className="text-muted-foreground text-sm">→</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile */}
      <div className="flex sm:hidden flex-col gap-2">
        {phases.map((p, i) => (
          <div key={i}>
            <div className={`rounded-lg border p-3 ${p.highlight ? "bg-accent/10 border-accent/40" : "bg-card border-border"}`}>
              <div className="flex items-center justify-between">
                <span className={`font-[500] text-sm ${p.highlight ? "text-accent" : "text-foreground"}`}>{p.title}</span>
                <span className={`text-[11px] ${p.highlight ? "text-accent/60" : "text-muted-foreground"}`}>{p.when}</span>
              </div>
              <div className="flex flex-wrap gap-x-3 mt-1">
                {p.items.map((item, j) => (
                  <span key={j} className={`text-[11px] ${p.highlight ? "text-accent/80" : "text-muted-foreground"}`}>· {item}</span>
                ))}
              </div>
            </div>
            {i < phases.length - 1 && <div className="text-center text-muted-foreground text-sm py-0.5">↓</div>}
          </div>
        ))}
      </div>

      <div className="mt-4 bg-secondary border border-border rounded-lg px-4 py-2 text-[11px] text-muted-foreground text-center">
        Raw data anonymized or deleted <strong className="text-foreground">6 months after the event</strong>
      </div>
    </div>
  );
}
