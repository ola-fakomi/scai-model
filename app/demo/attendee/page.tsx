"use client";

import { useState } from "react";
import DemoShell from "@/components/demo/DemoShell";
import { useDemoStore, type DemoStore } from "@/lib/store";
import { shortName } from "@/lib/seed";
import { scoreAll } from "@/lib/scoring";
import { INTENT_LABELS, INTEREST_GROUP_COLORS, Intent, InterestGroup, OutcomeType, SurveyDay } from "@/lib/types";
import { isTagExpired } from "@/lib/tags";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CheckCircle, Camera, Download, AlertCircle, Clock, User } from "lucide-react";

type PhoneView = "tag" | "score" | "survey";

export default function AttendeePage() {
  const store = useDemoStore();
  const { active_attendee_id, attendees, jumpToAfterMidnight } = store;
  const activeAttendee = active_attendee_id ? attendees.find((a) => a.id === active_attendee_id) : null;

  if (!active_attendee_id || !activeAttendee) {
    return (
      <DemoShell>
        <div className="flex justify-center py-16">
          <Card className="max-w-sm w-full">
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Attendee view</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Use the "Act as" picker above, or simulate the event first.
                </p>
              </div>
              <Button className="w-full" onClick={() => store.simulateEvent()}>
                Simulate event first
              </Button>
            </CardContent>
          </Card>
        </div>
      </DemoShell>
    );
  }

  const tagExpired = jumpToAfterMidnight || isTagExpired(activeAttendee.tag_expires_at);

  return (
    <DemoShell>
      <div className="flex justify-center">
        {/* Phone chrome */}
        <div className="w-[390px]">
          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-border overflow-hidden">
            {/* Status bar */}
            <div className="bg-primary px-5 pt-4 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                  <span className="text-white text-xs font-black">S</span>
                </div>
                <span className="text-white text-xs font-semibold">SCAI</span>
              </div>
              <span className="text-white/80 text-xs">
                {activeAttendee.name.split(" ")[0]}
                {activeAttendee.tag ? ` · ${activeAttendee.tag}` : ""}
              </span>
            </div>

            <PhoneNav attendee={activeAttendee} tagExpired={tagExpired} store={store} />
          </div>
        </div>
      </div>
    </DemoShell>
  );
}

function PhoneNav({ attendee, tagExpired, store }: {
  attendee: DemoStore["attendees"][number];
  tagExpired: boolean;
  store: DemoStore;
}) {
  const [view, setView] = useState<PhoneView>("tag");
  const scores = scoreAll(store);
  const myScore = scores.find((s) => s.attendee_id === attendee.id);

  const tabs = [
    { id: "tag" as PhoneView, label: attendee.tag ? "Tag" : "Claim" },
    { id: "score" as PhoneView, label: "Score" },
    { id: "survey" as PhoneView, label: "Survey" },
  ];

  return (
    <>
      <div className="flex border-b bg-background">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setView(t.id)}
            className={cn("flex-1 py-2.5 text-xs font-semibold transition-colors",
              view === t.id ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
            )}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="overflow-y-auto bg-secondary/10" style={{ maxHeight: "680px" }}>
        {view === "tag" && (attendee.tag
          ? <TagView attendee={attendee} tagExpired={tagExpired} store={store} />
          : <ClaimView attendee={attendee} store={store} />
        )}
        {view === "score" && <ScoreView attendee={attendee} score={myScore} store={store} />}
        {view === "survey" && <SurveyView attendee={attendee} store={store} />}
      </div>
    </>
  );
}

// ─── Claim ────────────────────────────────────────────────────────────────────

function ClaimView({ attendee, store }: { attendee: DemoStore["attendees"][number]; store: DemoStore }) {
  const [step, setStep] = useState<"email" | "form">(attendee.checked_in_at ? "form" : "email");
  const [email, setEmail] = useState(attendee.email);
  const [emailError, setEmailError] = useState("");
  const [interestGroup, setInterestGroup] = useState<InterestGroup | "">("");
  const [intent, setIntent] = useState<Intent | "">("");
  const [consent, setConsent] = useState(false);
  const [claimError, setClaimError] = useState("");

  const handleContinue = () => {
    const found = store.attendees.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!found) { setEmailError("Email not found on Luma."); return; }
    if (!found.checked_in_at) { setEmailError("You are not checked in yet. Please see the check-in desk."); return; }
    setEmailError(""); setStep("form");
  };

  const handleGetTag = () => {
    if (!interestGroup || !intent || !consent) { setClaimError("Fill all fields and tick consent."); return; }
    const result = store.claimTag(attendee.id, interestGroup as InterestGroup, intent as Intent, consent);
    if ("error" in result) setClaimError(result.error);
  };

  if (step === "email") {
    return (
      <div className="p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-foreground">Claim your tag</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Enter the email you used on Luma.</p>
        </div>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        {emailError && (
          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 p-2.5 rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" /> {emailError}
          </div>
        )}
        <Button className="w-full" onClick={handleContinue}>Continue</Button>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
        <CheckCircle className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm font-medium">Checked in</span>
      </div>

      <h2 className="font-semibold text-foreground">Your interest form</h2>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Interest group</label>
        <select value={interestGroup} onChange={(e) => setInterestGroup(e.target.value as InterestGroup)}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="">Select…</option>
          {(["Science", "Technology", "Engineering", "Math"] as InterestGroup[]).map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">I am here to…</label>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(INTENT_LABELS) as [Intent, string][]).map(([k, v]) => (
            <button key={k} onClick={() => setIntent(k)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                intent === k ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input hover:border-primary/50"
              )}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 accent-primary" />
        <span className="text-xs text-muted-foreground leading-relaxed">
          I agree that my name, interest group, intent, connections and survey answers are used to
          calculate my SCAI score, under the Nigeria Data Protection Act 2023. I can ask for my
          data to be deleted at any time.
        </span>
      </label>

      {claimError && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/5 p-2.5 rounded-md">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" /> {claimError}
        </div>
      )}

      <Button className="w-full" onClick={handleGetTag}>Get my tag</Button>
    </div>
  );
}

// ─── Tag page ─────────────────────────────────────────────────────────────────

function TagView({ attendee, tagExpired, store }: {
  attendee: DemoStore["attendees"][number];
  tagExpired: boolean;
  store: DemoStore;
}) {
  const [segCode, setSegCode] = useState("");
  const [segMsg, setSegMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [takeaway, setTakeaway] = useState("");
  const [scanOpen, setScanOpen] = useState(false);
  const [connectId, setConnectId] = useState<string | null>(null);

  const myTag = attendee.tag!;
  const groupNum = attendee.group_number!;
  const groupMembers = store.attendees.filter((a) => a.group_number === groupNum && a.id !== attendee.id && a.tag);
  const panelEnded = store.ended_segments.includes("panel");
  const myTakeaway = store.takeaways.find((t) => t.attendee_id === attendee.id);
  const myConns = store.connections.filter((c) =>
    (c.attendee_a === attendee.id || c.attendee_b === attendee.id) && c.confirmed_by_a && c.confirmed_by_b
  );
  const pendingRequests = store.connections.filter((c) =>
    c.attendee_b === attendee.id && c.confirmed_by_a && !c.confirmed_by_b
  );
  const peopleToScan = store.active_segment?.segment === "breakouts"
    ? store.attendees.filter((a) => a.id !== attendee.id && a.tag && a.group_number !== groupNum)
    : groupMembers;

  const handleSegCode = () => {
    if (!store.active_segment) { setSegMsg({ text: "No segment is active.", ok: false }); return; }
    const ok = store.enterSegmentCode(attendee.id, segCode);
    if (ok) {
      setSegMsg({ text: `✓ Logged for ${store.active_segment.segment}`, ok: true });
      setSegCode("");
    } else {
      setSegMsg({ text: "Wrong code. Try again.", ok: false });
    }
  };

  const handleConnect = (toId: string) => {
    const seg = store.active_segment?.segment === "breakouts" ? "breakouts" : "networking";
    store.sendConnectionRequest(attendee.id, toId, seg);
    setConnectId(toId); setScanOpen(false);
  };

  if (tagExpired) {
    return (
      <div className="p-5 space-y-4">
        <div className="text-center py-6">
          <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-semibold text-foreground">Tag expired</h2>
          <p className="text-sm text-muted-foreground mt-1">Tag {myTag} was valid until midnight.</p>
        </div>
        <ContactsList attendee={attendee} myConns={myConns} store={store} />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      {/* Big tag */}
      <div className="text-center bg-accent rounded-2xl p-5">
        <div className="text-6xl font-black text-primary tracking-tight">{myTag}</div>
        <p className="text-muted-foreground text-sm mt-1">Group {groupNum}</p>
        {attendee.interest_group && (
          <span className="inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: INTEREST_GROUP_COLORS[attendee.interest_group] + "22", color: INTEREST_GROUP_COLORS[attendee.interest_group] }}>
            {attendee.interest_group} · {attendee.intent ? INTENT_LABELS[attendee.intent] : ""}
          </span>
        )}
      </div>

      {/* QR */}
      <div className="flex flex-col items-center gap-1">
        <div className="p-3 bg-white rounded-xl border">
          <QRCodeSVG value={`scai:tag:${myTag}`} size={110} />
        </div>
        <p className="text-xs text-muted-foreground">Valid until midnight</p>
      </div>

      {/* Group members */}
      {groupMembers.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Group {groupNum}</h3>
          <div className="rounded-lg border divide-y">
            {groupMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-foreground">{shortName(m.name)}</span>
                <div className="flex items-center gap-1.5">
                  {m.interest_group && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: INTEREST_GROUP_COLORS[m.interest_group] + "22", color: INTEREST_GROUP_COLORS[m.interest_group] }}>
                      {m.interest_group}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Segment code */}
      {store.active_segment && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-amber-800">
            Enter code — {store.active_segment.segment}
          </p>
          <div className="flex gap-2">
            <Input value={segCode} onChange={(e) => setSegCode(e.target.value.toUpperCase())}
              placeholder="e.g. K7Q2" maxLength={4} className="uppercase font-mono" />
            <Button size="sm" onClick={handleSegCode} className="flex-shrink-0">Log</Button>
          </div>
          {segMsg && (
            <p className={cn("text-xs", segMsg.ok ? "text-emerald-700" : "text-destructive")}>{segMsg.text}</p>
          )}
        </div>
      )}

      {/* Takeaway */}
      {panelEnded && !myTakeaway && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-blue-800">Your one takeaway from today</p>
          <Textarea value={takeaway} onChange={(e) => setTakeaway(e.target.value)} rows={2}
            placeholder="What's the most useful thing you learned?" />
          <Button size="sm" className="w-full" onClick={() => { if (takeaway.trim()) store.submitTakeaway(attendee.id, takeaway.trim()); }}>
            Submit takeaway
          </Button>
        </div>
      )}
      {panelEnded && myTakeaway && (
        <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg">
          ✓ Takeaway submitted
        </div>
      )}

      {/* Scan to connect */}
      <Button variant="outline" className="w-full" onClick={() => setScanOpen(!scanOpen)}>
        <Camera className="h-4 w-4" /> Scan to connect (simulate)
      </Button>

      {scanOpen && (
        <div className="rounded-lg border bg-background divide-y max-h-48 overflow-y-auto">
          <div className="px-3 py-2 bg-secondary/30">
            <p className="text-xs text-muted-foreground">
              {store.active_segment?.segment === "breakouts" ? "Breakouts — anyone" : "Networking — your group"}
            </p>
          </div>
          {peopleToScan.slice(0, 20).map((p) => {
            const alreadyConn = store.connections.some((c) =>
              [c.attendee_a, c.attendee_b].sort().join("|") === [attendee.id, p.id].sort().join("|")
            );
            return (
              <button key={p.id} disabled={alreadyConn} onClick={() => handleConnect(p.id)}
                className={cn("w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left",
                  alreadyConn ? "opacity-40 cursor-default" : "hover:bg-secondary/40"
                )}>
                <span className="text-foreground">{p.tag} · {shortName(p.name)}</span>
                <span className="text-muted-foreground text-xs">{p.intent ? INTENT_LABELS[p.intent] : ""}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Connection confirm */}
      {connectId && (() => {
        const conn = store.connections.find((c) =>
          [c.attendee_a, c.attendee_b].sort().join("|") === [attendee.id, connectId].sort().join("|")
        );
        const other = store.attendees.find((a) => a.id === connectId);
        if (!conn || !other) return null;
        return (
          <div className="border border-primary/30 bg-accent/30 rounded-lg p-3 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              {shortName(other.name)} · {other.tag}
            </h3>
            <p className="text-xs text-muted-foreground">
              {other.interest_group} · {other.intent ? INTENT_LABELS[other.intent] : ""}
            </p>
            {conn.is_intent_match && (
              <Badge variant="success" className="text-xs">Intent match found!</Badge>
            )}
            <p className="text-xs text-muted-foreground">Counts when both confirm.</p>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => store.confirmConnection(conn.id, attendee.id)}>Confirm</Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setConnectId(null)}>Not now</Button>
            </div>
          </div>
        );
      })()}

      {/* Incoming requests */}
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Incoming ({pendingRequests.length})
          </h3>
          <div className="rounded-lg border divide-y">
            {pendingRequests.map((r) => {
              const from = store.attendees.find((a) => a.id === r.attendee_a);
              return from ? (
                <div key={r.id} className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-foreground">{shortName(from.name)} ({from.tag})</span>
                  <Button size="sm" className="h-7 text-xs" onClick={() => store.confirmConnection(r.id, attendee.id)}>
                    Confirm
                  </Button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Group photo */}
      {store.photo_time_active && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
          <h3 className="text-sm font-semibold text-purple-900">Did your group take its photo?</h3>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-0"
              onClick={() => store.confirmGroupPhoto(attendee.id)}>
              Group photo taken
            </Button>
            <Button size="sm" variant="outline" className="flex-1 border-purple-200 text-purple-700">Not yet</Button>
          </div>
        </div>
      )}

      {/* Contacts */}
      <ContactsList attendee={attendee} myConns={myConns} store={store} />
    </div>
  );
}

function ContactsList({ attendee, myConns, store }: {
  attendee: DemoStore["attendees"][number];
  myConns: DemoStore["connections"];
  store: DemoStore;
}) {
  if (myConns.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        Contacts ({myConns.length})
      </h3>
      <div className="rounded-lg border divide-y">
        {myConns.slice(0, 5).map((c) => {
          const other = store.attendees.find((a) =>
            a.id === (c.attendee_a === attendee.id ? c.attendee_b : c.attendee_a)
          );
          return other ? (
            <div key={c.id} className="flex items-center gap-2 px-3 py-2">
              <span className="text-sm text-foreground flex-1">{shortName(other.name)}</span>
              <span className="text-xs font-mono text-muted-foreground">{other.tag}</span>
              {c.is_intent_match && <Badge variant="success" className="text-xs">match</Badge>}
            </div>
          ) : null;
        })}
        {myConns.length > 5 && <p className="text-xs text-muted-foreground px-3 py-2">+{myConns.length - 5} more</p>}
      </div>
      <Button variant="outline" size="sm" className="w-full mt-2">
        <Download className="h-3.5 w-3.5" /> Download contacts (.vcf) · simulated
      </Button>
    </div>
  );
}

// ─── Score ────────────────────────────────────────────────────────────────────

function ScoreView({ attendee, score, store }: {
  attendee: DemoStore["attendees"][number];
  score: ReturnType<typeof scoreAll>[number] | undefined;
  store: DemoStore;
}) {
  if (!score) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-muted-foreground">Score not yet available. Simulate the event first.</p>
      </div>
    );
  }

  const { scai, provisional, persona, rank, total_checked_in, pillar_percentile } = score;
  const percentile = Math.round(((total_checked_in - rank) / total_checked_in) * 100);

  const PERSONA_VARIANTS: Record<string, "info" | "purple" | "warning" | "muted"> = {
    Connector: "info", Contributor: "purple", Seeker: "warning", Observer: "muted",
  };

  const pillars: { key: "P" | "E" | "N" | "M" | "F"; label: string; weight: string; highlight?: boolean }[] = [
    { key: "P", label: "Presence", weight: "10%" },
    { key: "E", label: "Engagement", weight: "15%" },
    { key: "N", label: "Networking", weight: "25%" },
    { key: "M", label: "Matching", weight: "30%", highlight: true },
    { key: "F", label: "Follow-through", weight: "20%" },
  ];

  const myConns = store.connections.filter((c) =>
    (c.attendee_a === attendee.id || c.attendee_b === attendee.id) && c.confirmed_by_a && c.confirmed_by_b
  );
  const nextSteps = [
    ...myConns.filter((c) => c.is_intent_match).map((c) => ({
      other: store.attendees.find((a) => a.id === (c.attendee_a === attendee.id ? c.attendee_b : c.attendee_a)),
      reason: "Intent match",
    })),
    ...myConns.filter((c) => !c.is_intent_match && c.is_cross_discipline).map((c) => ({
      other: store.attendees.find((a) => a.id === (c.attendee_a === attendee.id ? c.attendee_b : c.attendee_a)),
      reason: "Cross-discipline",
    })),
  ].filter((x) => x.other).slice(0, 3);

  return (
    <div className="p-5 space-y-5">
      {/* Score */}
      <div className="text-center bg-accent rounded-2xl py-6 px-4">
        <div className="text-7xl font-black text-primary leading-none">{scai}</div>
        <p className="text-muted-foreground text-sm mt-1">out of 100</p>
        {provisional && <Badge variant="warning" className="mt-2">Provisional until day 7 survey</Badge>}
        <div className="flex justify-center gap-2 mt-3">
          <Badge variant={PERSONA_VARIANTS[persona] ?? "muted"}>{persona}</Badge>
          <Badge variant="secondary">Top {100 - percentile}%</Badge>
        </div>
      </div>

      {/* Pillar bars */}
      <div className="space-y-3">
        {pillars.map((p) => {
          const val = p.key === "F" ? (pillar_percentile.F ?? null) : (pillar_percentile[p.key] as number);
          return (
            <div key={p.key}>
              <div className="flex items-center justify-between mb-1">
                <span className={cn("text-xs font-semibold", p.highlight ? "text-amber-700" : "text-foreground")}>
                  {p.label} {p.highlight && <span className="text-amber-500">★</span>}
                </span>
                <span className="text-xs text-muted-foreground">{val !== null ? Math.round(val) : "—"} · {p.weight}</span>
              </div>
              <Progress value={val ?? 0} indicatorClassName={p.highlight ? "bg-amber-500" : undefined} />
            </div>
          );
        })}
      </div>

      {/* Next steps */}
      {nextSteps.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Suggested next steps</h3>
          <div className="rounded-lg border divide-y">
            {nextSteps.map(({ other, reason }, i) => other ? (
              <div key={i} className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-foreground">{shortName(other.name)} <span className="text-muted-foreground font-mono text-xs">{other.tag}</span></span>
                <Badge variant={reason === "Intent match" ? "success" : "info"} className="text-xs">{reason}</Badge>
              </div>
            ) : null)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Survey ───────────────────────────────────────────────────────────────────

function SurveyView({ attendee, store }: { attendee: DemoStore["attendees"][number]; store: DemoStore }) {
  const [day, setDay] = useState<SurveyDay>(7);
  const [followUps, setFollowUps] = useState("2");
  const [meetings, setMeetings] = useState("1");
  const [nps, setNps] = useState<number | null>(null);
  const [outcomes, setOutcomes] = useState<OutcomeType[]>([]);

  const existing = store.surveys.find((s) => s.attendee_id === attendee.id && s.day === day);
  const toggleOutcome = (o: OutcomeType) =>
    setOutcomes((prev) => prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]);

  if (existing) {
    return (
      <div className="p-5 space-y-4">
        <div className="text-center py-4">
          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-semibold text-foreground">Day {day} survey submitted</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Follow-ups: {existing.follow_ups_sent} · Meetings: {existing.meetings_held}
          </p>
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as SurveyDay[]).map((d) => (
            <Button key={d} size="sm" variant={day === d ? "default" : "outline"} className="flex-1" onClick={() => setDay(d)}>
              Day {d}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-4">
      <h2 className="font-semibold text-foreground">Check-in survey</h2>

      <div className="flex gap-2">
        {([7, 30, 90] as SurveyDay[]).map((d) => (
          <Button key={d} size="sm" variant={day === d ? "default" : "outline"} className="flex-1" onClick={() => setDay(d)}>
            Day {d}
          </Button>
        ))}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Follow-ups sent</label>
        <Input type="number" min="0" value={followUps} onChange={(e) => setFollowUps(e.target.value)} />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Meetings held</label>
        <Input type="number" min="0" value={meetings} onChange={(e) => setMeetings(e.target.value)} />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Outcomes</label>
        <div className="flex flex-wrap gap-2">
          {(["hire", "deal", "partnership", "investment", "other"] as OutcomeType[]).map((o) => (
            <button key={o} onClick={() => toggleOutcome(o)}
              className={cn("px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize",
                outcomes.includes(o) ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-input"
              )}>
              {o}
            </button>
          ))}
        </div>
      </div>

      {day === 7 && (
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            Would you recommend CCI STEM Connect? (0–10)
          </label>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <button key={n} onClick={() => setNps(n)}
                className={cn("w-8 h-8 rounded-md text-xs font-semibold border transition-all",
                  nps === n ? "bg-primary text-primary-foreground border-primary" :
                  n >= 9 ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50" :
                  n <= 6 ? "border-red-200 text-red-500 hover:bg-red-50" :
                  "border-input text-muted-foreground hover:bg-secondary"
                )}>
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button className="w-full" onClick={() => store.submitSurvey(attendee.id, day, parseInt(followUps) || 0, parseInt(meetings) || 0, outcomes, day === 7 ? nps : null)}>
        Submit survey
      </Button>
      <p className="text-xs text-muted-foreground text-center">Survey email sent (simulated)</p>
    </div>
  );
}
