"use client";

import { useState } from "react";
import DemoShell from "@/components/demo/DemoShell";
import { useDemoStore } from "@/lib/store";
import { shortName } from "@/lib/seed";
import { SEGMENTS_IN_ORDER, Segment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  UserCheck, Play, Square, Mic, Coffee, Camera,
  AlertCircle, CheckCircle, Search, Tag, ChevronRight,
} from "lucide-react";

type StaffTab = "door" | "segments" | "notetaker" | "usher";

export default function StaffPage() {
  const [tab, setTab] = useState<StaffTab>("door");

  const tabs: { id: StaffTab; label: string; icon: React.ReactNode }[] = [
    { id: "door", label: "Door", icon: <UserCheck className="h-4 w-4" /> },
    { id: "segments", label: "Segments", icon: <Play className="h-4 w-4" /> },
    { id: "notetaker", label: "Note-taker", icon: <Mic className="h-4 w-4" /> },
    { id: "usher", label: "Usher", icon: <Coffee className="h-4 w-4" /> },
  ];

  return (
    <DemoShell>
      <Card className="max-w-2xl mx-auto">
        {/* Tab nav */}
        <div className="flex border-b">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors",
                tab === t.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        <CardContent className="pt-5">
          {tab === "door" && <DoorTab />}
          {tab === "segments" && <SegmentsTab />}
          {tab === "notetaker" && <NotetakerTab />}
          {tab === "usher" && <UsherTab />}
        </CardContent>
      </Card>
    </DemoShell>
  );
}

// ─── Door ─────────────────────────────────────────────────────────────────────

function DoorTab() {
  const store = useDemoStore();
  const [search, setSearch] = useState("");
  const [walkInMode, setWalkInMode] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInEmail, setWalkInEmail] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [tagResult, setTagResult] = useState("");

  const filtered = store.attendees.filter((a) =>
    search
      ? a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const checkedInCount = store.attendees.filter((a) => a.checked_in_at).length;

  const handleAssignTag = (attendeeId: string) => {
    const a = store.attendees.find((x) => x.id === attendeeId);
    if (!a) return;
    const result = store.claimTag(attendeeId, a.interest_group ?? "Technology", a.intent ?? "partner", true);
    if ("error" in result) setTagResult(`Error: ${result.error}`);
    else setTagResult(`Tag assigned: ${result.tag}`);
  };

  const handleWalkIn = () => {
    if (!walkInName || !walkInEmail) return;
    store.registerWalkIn(walkInName, walkInEmail, walkInPhone);
    setWalkInName(""); setWalkInEmail(""); setWalkInPhone(""); setWalkInMode(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Door check-in</h2>
        <Badge variant="secondary">{checkedInCount} / {store.attendees.length}</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="max-h-72 overflow-y-auto rounded-md border divide-y">
        {filtered.slice(0, 30).map((a) => (
          <div key={a.id} className="flex items-center justify-between px-3 py-2 hover:bg-secondary/40 transition-colors">
            <div>
              <span className="text-sm font-medium text-foreground">{shortName(a.name)}</span>
              <span className="text-xs text-muted-foreground ml-2">{a.luma_ticket_id}</span>
            </div>
            <div className="flex items-center gap-2">
              {a.checked_in_at ? (
                <>
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle className="h-3 w-3" /> In
                  </span>
                  {!a.tag ? (
                    <Button size="sm" variant="outline" className="h-6 text-xs px-2" onClick={() => handleAssignTag(a.id)}>
                      <Tag className="h-3 w-3" /> Assign tag
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="font-mono">{a.tag}</Badge>
                  )}
                </>
              ) : (
                <Button size="sm" className="h-7 text-xs" onClick={() => store.checkIn(a.id)}>
                  Check in
                </Button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground p-4 text-center">No results</p>
        )}
      </div>

      {tagResult && (
        <div className="text-sm text-primary bg-accent/50 p-2.5 rounded-md">{tagResult}</div>
      )}

      <Button
        variant={walkInMode ? "secondary" : "outline"}
        className="w-full"
        onClick={() => setWalkInMode(!walkInMode)}
      >
        {walkInMode ? "Cancel walk-in" : "Register walk-in"}
      </Button>

      {walkInMode && (
        <div className="space-y-2 p-3 border rounded-lg bg-secondary/20">
          <Input placeholder="Full name" value={walkInName} onChange={(e) => setWalkInName(e.target.value)} />
          <Input placeholder="Email" type="email" value={walkInEmail} onChange={(e) => setWalkInEmail(e.target.value)} />
          <Input placeholder="Phone (optional)" value={walkInPhone} onChange={(e) => setWalkInPhone(e.target.value)} />
          <Button className="w-full" onClick={handleWalkIn}>Register & check in</Button>
        </div>
      )}
    </div>
  );
}

// ─── Segments ─────────────────────────────────────────────────────────────────

function SegmentsTab() {
  const store = useDemoStore();
  const [codes, setCodes] = useState<Record<string, string>>({});

  const handleStart = (seg: Segment) => {
    const code = store.startSegment(seg);
    setCodes((prev) => ({ ...prev, [seg]: code }));
  };

  const labels: Record<Segment, string> = {
    keynote: "Keynote",
    panel: "Panel",
    networking: "Numbered Networking",
    breakouts: "Breakouts",
    refreshments: "Refreshments",
  };

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-foreground">Segment control</h2>

      {store.active_segment && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
            Active · {labels[store.active_segment.segment]}
          </p>
          <div className="text-5xl font-black text-emerald-800 tracking-widest font-mono">
            {store.active_segment.code}
          </div>
          <p className="text-xs text-emerald-600 mt-2">Show on screen for attendees to enter</p>
        </div>
      )}

      <div className="space-y-2">
        {SEGMENTS_IN_ORDER.map((seg) => {
          const isActive = store.active_segment?.segment === seg;
          const isEnded = store.ended_segments.includes(seg);
          return (
            <div key={seg} className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              isActive ? "border-emerald-300 bg-emerald-50" : isEnded ? "border-border/50 bg-secondary/30" : "border-border"
            )}>
              <div>
                <span className={cn("text-sm font-medium", isEnded ? "text-muted-foreground" : "text-foreground")}>
                  {labels[seg]}
                </span>
                {isEnded && <Badge variant="muted" className="ml-2 text-xs">ended</Badge>}
                {codes[seg] && !isActive && <span className="ml-2 text-xs font-mono text-muted-foreground">({codes[seg]})</span>}
              </div>
              <div className="flex gap-1.5">
                {!isActive && !isEnded && (
                  <Button size="sm" className="h-7 text-xs" onClick={() => handleStart(seg)}>
                    <Play className="h-3 w-3" /> Start
                  </Button>
                )}
                {isActive && (
                  <>
                    {seg === "panel" && (
                      <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => store.endSegment(seg)}>
                        End Panel
                      </Button>
                    )}
                    {seg === "networking" && (
                      <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => store.triggerPhotoTime()}>
                        <Camera className="h-3 w-3" /> Photo time
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => store.endSegment(seg)}>
                      <Square className="h-3 w-3" /> End
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Note-taker ───────────────────────────────────────────────────────────────

function NotetakerTab() {
  const store = useDemoStore();
  const [tag, setTag] = useState("");
  const [quality, setQuality] = useState<1 | 2 | 3 | null>(null);
  const [segment, setSegment] = useState<"keynote" | "panel">("keynote");
  const [preview, setPreview] = useState<{ name: string } | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTagLookup = (t: string) => {
    const upper = t.toUpperCase();
    setTag(upper);
    const a = store.attendees.find((x) => x.tag === upper);
    setPreview(a ? { name: a.name } : null);
    setError(a ? "" : upper ? "Tag not found" : "");
  };

  const handleLog = () => {
    if (!tag || !quality) { setError("Enter a tag and select a quality rating."); return; }
    store.logQuestion(tag, segment, quality, "staff_notetaker");
    setSuccess(`✓ Logged for ${tag} (quality ${quality})`);
    setError(""); setTag(""); setQuality(null); setPreview(null);
  };

  const recentQuestions = store.questions.slice(-5).reverse();

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-foreground">Question log</h2>

      <div className="flex gap-2">
        {(["keynote", "panel"] as const).map((s) => (
          <Button
            key={s}
            variant={segment === s ? "default" : "outline"}
            size="sm"
            className="flex-1 capitalize"
            onClick={() => setSegment(s)}
          >{s}</Button>
        ))}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Tag number</label>
        <Input
          value={tag}
          onChange={(e) => handleTagLookup(e.target.value)}
          placeholder="e.g. 7C"
          className="uppercase font-mono"
          maxLength={5}
        />
        {preview && <p className="text-xs text-emerald-600">✓ {preview.name}</p>}
        {error && tag && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {error}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Quality</label>
        <div className="flex gap-2">
          {([1, 2, 3] as (1|2|3)[]).map((q) => (
            <Button
              key={q}
              variant={quality === q ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setQuality(q)}
            >
              {q === 1 ? "1 · Basic" : q === 2 ? "2 · Good" : "3 · Great"}
            </Button>
          ))}
        </div>
      </div>

      {error && !tag && <p className="text-xs text-destructive">{error}</p>}
      {success && <p className="text-xs text-emerald-600">{success}</p>}

      <Button className="w-full" onClick={handleLog}>Log question</Button>

      {recentQuestions.length > 0 && (
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">Recent</span>
            <button onClick={() => store.undoLastQuestion()} className="text-xs text-destructive hover:underline">
              Undo last
            </button>
          </div>
          <div className="rounded-md border divide-y">
            {recentQuestions.map((q) => (
              <div key={q.id} className="flex justify-between px-3 py-2 text-sm">
                <span className="font-mono text-foreground">{q.tag}</span>
                <span className="text-muted-foreground capitalize">{q.segment}</span>
                <Badge variant={q.quality === 3 ? "success" : q.quality === 2 ? "info" : "muted"}>
                  Q{q.quality}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Usher ────────────────────────────────────────────────────────────────────

function UsherTab() {
  const store = useDemoStore();
  const [tag, setTag] = useState("");
  const [preview, setPreview] = useState<{ name: string; id: string } | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "warn" } | null>(null);

  const handleTagLookup = (t: string) => {
    const upper = t.toUpperCase();
    setTag(upper);
    const a = store.attendees.find((x) => x.tag === upper);
    setPreview(a ? { name: a.name, id: a.id } : null);
    setMessage(null);
  };

  const handleServe = () => {
    if (!preview) return;
    const result = store.serveRefreshment(preview.id, "staff_usher");
    if (result.error) setMessage({ text: result.error, type: "warn" });
    else { setMessage({ text: `✓ Served: ${preview.name}`, type: "success" }); setTag(""); setPreview(null); }
  };

  const recentServed = store.refreshments.slice(-8).reverse();

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-foreground">Refreshments log</h2>
      <p className="text-sm text-muted-foreground">Enter each person's tag when you serve them.</p>

      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Tag number</label>
        <Input
          value={tag}
          onChange={(e) => handleTagLookup(e.target.value)}
          placeholder="e.g. 7C"
          className="uppercase font-mono"
          maxLength={5}
        />
        {preview && <p className="text-xs text-emerald-600">✓ {preview.name}</p>}
        {tag && !preview && <p className="text-xs text-destructive">Tag not found</p>}
      </div>

      {message && (
        <div className={cn("text-sm p-2.5 rounded-md",
          message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
        )}>
          {message.text}
        </div>
      )}

      <Button className="w-full" disabled={!preview} onClick={handleServe}>Mark served</Button>

      {recentServed.length > 0 && (
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">Recent</span>
            <Badge variant="secondary">{store.refreshments.length} total</Badge>
          </div>
          <div className="rounded-md border divide-y">
            {recentServed.map((r) => {
              const a = store.attendees.find((x) => x.id === r.attendee_id);
              return a ? (
                <div key={r.attendee_id} className="flex justify-between px-3 py-2 text-sm">
                  <span className="font-mono text-foreground">{a.tag}</span>
                  <span className="text-foreground">{shortName(a.name)}</span>
                  <span className="text-muted-foreground text-xs">
                    {new Date(r.served_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
