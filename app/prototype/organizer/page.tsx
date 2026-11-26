"use client";

import { useState, useMemo } from "react";
import TabLayout from "@/components/TabLayout";
import DemoShell from "@/components/demo/DemoShell";
import { useDemoStore } from "@/lib/store";
import { scoreAll, computeKPIs } from "@/lib/scoring";
import { shortName } from "@/lib/seed";
import {
  INTENT_LABELS, INTEREST_GROUP_COLORS, PILLAR_WEIGHTS,
  Intent, InterestGroup, AttendeeScore,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

type SortKey = "rank" | "scai" | "name" | "group";
type SortDir = "asc" | "desc";

const PERSONA_VARIANTS: Record<string, "info" | "purple" | "warning" | "muted"> = {
  Connector: "info",
  Contributor: "purple",
  Seeker: "warning",
  Observer: "muted",
};

export default function OrganizerPage() {
  const store = useDemoStore();
  const [weights, setWeights] = useState({ ...PILLAR_WEIGHTS });
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showWeights, setShowWeights] = useState(false);

  const scores = useMemo(() => scoreAll(store, weights), [store, weights]);
  const kpis = useMemo(() => computeKPIs(store, scores), [store, scores]);
  const checkedInCount = store.attendees.filter((a) => a.checked_in_at).length;

  if (checkedInCount === 0) {
    return (
      <TabLayout wide>
      <DemoShell>
        <Card className="max-w-md mx-auto mt-16">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
              <Icon icon="solar:users-group-two-rounded-linear" className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">No data yet</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Simulate event" to fill the scoreboard.
              </p>
            </div>
            <Button onClick={() => store.simulateEvent()} variant="accent">
              Simulate event
            </Button>
          </CardContent>
        </Card>
      </DemoShell>
      </TabLayout>
    );
  }

  const selectedScore = selectedId ? scores.find((s) => s.attendee_id === selectedId) : null;
  const selectedAttendee = selectedId ? store.attendees.find((a) => a.id === selectedId) : null;

  const sorted = [...scores].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "rank") cmp = a.rank - b.rank;
    else if (sortKey === "scai") cmp = b.scai - a.scai;
    else if (sortKey === "name") {
      const an = store.attendees.find((x) => x.id === a.attendee_id)?.name ?? "";
      const bn = store.attendees.find((x) => x.id === b.attendee_id)?.name ?? "";
      cmp = an.localeCompare(bn);
    } else if (sortKey === "group") {
      const aa = store.attendees.find((x) => x.id === a.attendee_id);
      const ba = store.attendees.find((x) => x.id === b.attendee_id);
      cmp = (aa?.interest_group ?? "").localeCompare(ba?.interest_group ?? "");
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === "asc" ? <Icon icon="solar:alt-arrow-up-linear" className="h-3 w-3" /> : <Icon icon="solar:alt-arrow-down-linear" className="h-3 w-3" />) : null;

  const groupChartData = (Object.entries(kpis.avg_scai_by_group) as [InterestGroup, number][])
    .map(([g, v]) => ({ name: g, value: Math.round(v) }));

  const unmatchedList = Object.entries(kpis.unmatched_needs).filter(([, v]) => v > 0) as [Intent, number][];

  const bridgerAttendees = kpis.bridgers.map((b) => ({
    ...b, attendee: store.attendees.find((a) => a.id === b.attendee_id),
  }));

  const handleExport = () => {
    const rows = scores.map((s) => {
      const a = store.attendees.find((x) => x.id === s.attendee_id);
      return [
        a?.tag ?? "", a?.interest_group ?? "",
        Math.round(s.pillar_percentile.P), Math.round(s.pillar_percentile.E),
        Math.round(s.pillar_percentile.N), Math.round(s.pillar_percentile.M),
        s.pillar_percentile.F !== null ? Math.round(s.pillar_percentile.F) : "",
        s.scai, s.persona,
      ].join(",");
    });
    const csv = ["tag,interest_group,P,E,N,M,F,scai,persona", ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "scai-event-report.csv"; a.click();
  };

  return (
    <TabLayout wide>
    <DemoShell>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">SCAI Organizer Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Sample data · {checkedInCount} attendees checked in · {scores.length} scored
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Icon icon="solar:download-linear" className="h-3.5 w-3.5" /> Download CSV
          </Button>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <KpiCard label="Attendees" value={kpis.attendees.toString()} icon={<Icon icon="solar:users-group-two-rounded-linear" className="h-4 w-4" />} />
          <KpiCard label="Match rate" value={`${Math.round(kpis.match_rate * 100)}%`} icon={<Icon icon="solar:link-linear" className="h-4 w-4" />} />
          <KpiCard label="Cross-group" value={`${Math.round(kpis.cross_group_links * 100)}%`} icon={<Icon icon="solar:graph-up-linear" className="h-4 w-4" />} />
          <KpiCard label="Avg SCAI" value={kpis.avg_scai.toString()} icon={<Icon icon="solar:star-linear" className="h-4 w-4" />} />
          <KpiCard
            label="NPS"
            value={kpis.nps !== null ? (kpis.nps >= 0 ? `+${kpis.nps}` : kpis.nps.toString()) : "—"}
            icon={<Icon icon="solar:chart-2-linear" className="h-4 w-4" />}
            positive={kpis.nps !== null && kpis.nps > 0}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Attendees table */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top attendees</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-secondary/40">
                    {[
                      { key: "rank" as SortKey, label: "#", w: "w-8" },
                      { key: "name" as SortKey, label: "Name", w: "" },
                      { key: "group" as SortKey, label: "Group", w: "" },
                      { key: "scai" as SortKey, label: "SCAI", w: "w-16" },
                    ].map((col) => (
                      <th
                        key={col.key}
                        onClick={() => toggleSort(col.key)}
                        className={cn("px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground select-none", col.w)}
                      >
                        <span className="flex items-center gap-0.5">{col.label} <SortIcon k={col.key} /></span>
                      </th>
                    ))}
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">Persona</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.slice(0, 20).map((s) => {
                    const a = store.attendees.find((x) => x.id === s.attendee_id);
                    if (!a) return null;
                    const isSelected = selectedId === s.attendee_id;
                    return (
                      <tr
                        key={s.attendee_id}
                        onClick={() => setSelectedId(isSelected ? null : s.attendee_id)}
                        className={cn(
                          "border-b border-border/50 cursor-pointer transition-colors",
                          isSelected ? "bg-accent/15 border-accent/30" : "hover:bg-secondary/40"
                        )}
                      >
                        <td className="px-4 py-2.5 text-muted-foreground text-xs font-mono">{s.rank}</td>
                        <td className="px-4 py-2.5">
                          <span className="font-medium text-foreground">{shortName(a.name)}</span>
                          <span className="text-muted-foreground text-xs ml-1.5 font-mono">{a.tag}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <GroupBadge group={a.interest_group} />
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="font-[600] text-accent text-base tabular-nums">{s.scai}</span>
                          {s.provisional && <span className="text-amber-400 text-xs ml-0.5">~</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant={PERSONA_VARIANTS[s.persona] ?? "muted"} className="text-xs">
                            {s.persona}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Right column */}
          <div className="space-y-4">
            {/* SCAI by group */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Avg SCAI by group</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={groupChartData} layout="vertical" margin={{ left: 0, right: 8 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={85} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v) => [Math.round(Number(v)), "SCAI"]} cursor={{ fill: "var(--accent)" }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {groupChartData.map((entry) => (
                        <Cell key={entry.name} fill={INTEREST_GROUP_COLORS[entry.name as InterestGroup] ?? "#1F5FBF"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Unmatched needs */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Unmatched needs</CardTitle>
                  <span className="text-xs text-accent font-[500]">Send intros before day 7</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                {unmatchedList.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-medium">All intents matched!</p>
                ) : (
                  unmatchedList.map(([intent, count]) => (
                    <div key={intent} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-sm text-foreground">{INTENT_LABELS[intent]}</span>
                      <Badge variant="warning">{count}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Bridgers */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top bridgers</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                {bridgerAttendees.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No connections yet</p>
                ) : (
                  bridgerAttendees.map((b, i) => (
                    <div key={b.attendee_id} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
                      <span className="text-xs text-muted-foreground w-4 font-mono">{i + 1}</span>
                      <span className="text-xs font-mono text-foreground">{b.attendee?.tag}</span>
                      <span className="text-sm text-foreground flex-1">{b.attendee ? shortName(b.attendee.name) : "—"}</span>
                      <span className="text-xs text-muted-foreground">{b.centrality.toFixed(0)}</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Weights panel */}
            <Card>
              <CardHeader
                className="pb-2 cursor-pointer"
                onClick={() => setShowWeights(!showWeights)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Tune weights · live re-ranking</CardTitle>
                  <Icon icon={showWeights ? "solar:alt-arrow-up-linear" : "solar:alt-arrow-down-linear"} className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              {showWeights && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {(["P", "E", "N", "M", "F"] as (keyof typeof weights)[]).map((k) => {
                      const labels: Record<string, string> = { P: "Presence", E: "Engagement", N: "Networking", M: "Matching", F: "Follow-through" };
                      return (
                        <div key={k}>
                          <div className="flex justify-between mb-1">
                            <label className="text-xs font-medium text-muted-foreground">{labels[k]}</label>
                            <span className="text-xs font-[600] text-accent tabular-nums">{Math.round(weights[k] * 100)}%</span>
                          </div>
                          <input
                            type="range" min="0" max="1" step="0.05" value={weights[k]}
                            onChange={(e) => setWeights((prev) => ({ ...prev, [k]: parseFloat(e.target.value) }))}
                            className="w-full accent-primary"
                          />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selectedScore && selectedAttendee && (
        <div className="fixed inset-y-0 right-0 w-80 bg-card border-l border-border z-50 overflow-y-auto">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground">{shortName(selectedAttendee.name)}</h2>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedId(null)}>
                <Icon icon="solar:close-circle-linear" className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-lg font-[600] text-accent">{selectedAttendee.tag}</span>
              <GroupBadge group={selectedAttendee.interest_group} />
              <Badge variant={PERSONA_VARIANTS[selectedScore.persona] ?? "muted"}>{selectedScore.persona}</Badge>
            </div>

            <div className="text-center bg-accent/10 border border-accent/20 rounded-lg py-5">
              <div className="text-5xl font-[600] text-accent tabular-nums score-reveal">{selectedScore.scai}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Rank {selectedScore.rank} of {selectedScore.total_checked_in}
              </div>
              {selectedScore.provisional && <Badge variant="warning" className="mt-2">Provisional</Badge>}
            </div>

            <div className="space-y-2.5">
              {(["P", "E", "N", "M", "F"] as const).map((k) => {
                const val = k === "F" ? selectedScore.pillar_percentile.F : selectedScore.pillar_percentile[k];
                const labels: Record<string, string> = { P: "Presence", E: "Engagement", N: "Networking", M: "Matching", F: "Follow-through" };
                return (
                  <div key={k}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={cn("font-medium", k === "M" ? "text-amber-600" : "text-foreground")}>{labels[k]}</span>
                      <span className="text-muted-foreground">{val !== null ? Math.round(val) : "—"}</span>
                    </div>
                    <Progress value={val ?? 0} indicatorClassName={k === "M" ? "bg-amber-500" : undefined} />
                  </div>
                );
              })}
            </div>

            <Separator />
            <div className="space-y-1.5 text-sm">
              <h3 className="font-semibold text-foreground">Raw metrics</h3>
              {[
                ["Intent", selectedAttendee.intent ? INTENT_LABELS[selectedAttendee.intent] : "—"],
                ["Confirmed connections", store.connections.filter((c) =>
                  (c.attendee_a === selectedAttendee.id || c.attendee_b === selectedAttendee.id) && c.confirmed_by_a && c.confirmed_by_b
                ).length.toString()],
                ["Questions asked", store.questions.filter((q) => q.attendee_id === selectedAttendee.id).length.toString()],
                ["Takeaway", store.takeaways.some((t) => t.attendee_id === selectedAttendee.id) ? "Yes" : "No"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DemoShell>
    </TabLayout>
  );
}

function KpiCard({ label, value, icon, positive }: { label: string; value: string; icon: React.ReactNode; positive?: boolean }) {
  return (
    <Card className={cn(positive && "border-emerald-500/30 bg-emerald-500/5")}>
      <CardContent className="pt-4 pb-3">
        <div className={cn("flex items-center gap-1.5 text-muted-foreground mb-2", positive && "text-emerald-400")}>
          {icon}
          <span className="text-xs font-[500] uppercase tracking-wider">{label}</span>
        </div>
        <div className={cn("text-2xl font-[600] tabular-nums", positive ? "text-emerald-400" : "text-foreground")}>{value}</div>
      </CardContent>
    </Card>
  );
}

function GroupBadge({ group }: { group: string | null }) {
  if (!group) return null;
  const color = INTEREST_GROUP_COLORS[group as InterestGroup] ?? "#888";
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ background: color + "22", color }}>
      {group}
    </span>
  );
}

