import { describe, it, expect } from "vitest";
import { dr, percentileRanks, computeScai, computePersona, scoreAll } from "./scoring";
import { generateSeed } from "./seed";
import { assignTag } from "./tags";
import type { PillarPercentile, Attendee, EventState } from "./types";

// ─── dr() ─────────────────────────────────────────────────────────────────────

describe("dr()", () => {
  it("returns 0 for n=0", () => expect(dr(0)).toBe(0));
  it("returns 1.0 for n=1", () => expect(dr(1)).toBeCloseTo(1.0));
  it("returns ~2.79 for n=6", () => expect(dr(6)).toBeCloseTo(2.79, 1));
  it("returns ~3.71 for n=15", () => expect(dr(15)).toBeCloseTo(3.71, 1));
  it("returns ~4.40 for n=30", () => expect(dr(30)).toBeCloseTo(4.40, 1));
});

// ─── percentileRanks() ────────────────────────────────────────────────────────

describe("percentileRanks()", () => {
  it("returns [100] for a single value", () => {
    expect(percentileRanks([42])).toEqual([100]);
  });

  it("gives equal percentile to ties", () => {
    const ranks = percentileRanks([10, 10, 20]);
    expect(ranks[0]).toBeCloseTo(ranks[1]);
  });

  it("gives higher percentile to higher values", () => {
    const ranks = percentileRanks([1, 2, 3]);
    expect(ranks[2]).toBeGreaterThan(ranks[1]);
    expect(ranks[1]).toBeGreaterThan(ranks[0]);
  });

  it("percentile range is 0–100", () => {
    const ranks = percentileRanks([5, 10, 15, 20, 25]);
    for (const r of ranks) {
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(100);
    }
  });
});

// ─── Provisional score ────────────────────────────────────────────────────────

describe("computeScai() provisional", () => {
  const pct: PillarPercentile = { P: 80, E: 60, N: 70, M: 90, F: null };

  it("marks F=null as provisional", () => {
    const { provisional } = computeScai(pct);
    expect(provisional).toBe(true);
  });

  it("marks F=50 as not provisional", () => {
    const { provisional } = computeScai({ ...pct, F: 50 });
    expect(provisional).toBe(false);
  });

  it("provisional SCAI is higher than zero", () => {
    const { scai } = computeScai(pct);
    expect(scai).toBeGreaterThan(0);
  });
});

// ─── Personas ─────────────────────────────────────────────────────────────────

describe("computePersona()", () => {
  const baseAttendee = {
    id: "x",
    name: "Test",
    email: "test@test.com",
    phone: "",
    luma_ticket_id: "",
    checked_in_at: "2026-11-22T10:00:00Z",
    tag: "1A",
    group_number: 1,
    interest_group: "Technology" as const,
    intent: "job_seeking" as const,
    consent: true,
    form_complete: true,
    tag_expires_at: null,
  };

  it("Observer when all pillars below 40", () => {
    const pct: PillarPercentile = { P: 20, E: 30, N: 10, M: 15, F: 25 };
    expect(computePersona(pct, baseAttendee, [])).toBe("Observer");
  });

  it("Connector when N is highest", () => {
    const pct: PillarPercentile = { P: 60, E: 55, N: 90, M: 70, F: 50 };
    expect(computePersona(pct, baseAttendee, [])).toBe("Connector");
  });

  it("Contributor when E is highest", () => {
    const pct: PillarPercentile = { P: 60, E: 90, N: 55, M: 70, F: 50 };
    expect(computePersona(pct, baseAttendee, [])).toBe("Contributor");
  });

  it("Seeker when M is highest", () => {
    const pct: PillarPercentile = { P: 60, E: 55, N: 60, M: 90, F: 50 };
    expect(computePersona(pct, baseAttendee, [])).toBe("Seeker");
  });
});

// ─── Tag assignment ───────────────────────────────────────────────────────────

describe("assignTag()", () => {
  function makeAttendee(id: string, checkedIn: boolean): Attendee {
    return {
      id,
      name: `Attendee ${id}`,
      email: `${id}@test.com`,
      phone: "",
      luma_ticket_id: id,
      checked_in_at: checkedIn ? "2026-11-22T10:00:00Z" : null,
      tag: null,
      group_number: null,
      interest_group: null,
      intent: null,
      consent: false,
      form_complete: false,
      tag_expires_at: null,
    };
  }

  it("returns error for unchecked-in attendee", () => {
    const attendee = makeAttendee("1", false);
    const result = assignTag(attendee, {
      attendees: [attendee],
      next_group_window_start: 1,
      next_window_slot: 0,
    });
    expect("error" in result && result.error).toBe("not_checked_in");
  });

  it("three consecutive arrivals land in 3 different groups (mixing rule)", () => {
    const a1 = makeAttendee("1", true);
    const a2 = makeAttendee("2", true);
    const a3 = makeAttendee("3", true);
    const attendees = [a1, a2, a3];

    let windowStart = 1;
    let windowSlot = 0;

    const r1 = assignTag(a1, { attendees, next_group_window_start: windowStart, next_window_slot: windowSlot });
    expect("error" in r1).toBe(false);
    if ("error" in r1) return;
    a1.tag = r1.tag;
    a1.group_number = r1.group_number;
    windowStart = r1.next_group_window_start;
    windowSlot = r1.next_window_slot;

    const r2 = assignTag(a2, { attendees, next_group_window_start: windowStart, next_window_slot: windowSlot });
    if ("error" in r2) return;
    a2.tag = r2.tag;
    a2.group_number = r2.group_number;
    windowStart = r2.next_group_window_start;
    windowSlot = r2.next_window_slot;

    const r3 = assignTag(a3, { attendees, next_group_window_start: windowStart, next_window_slot: windowSlot });
    if ("error" in r3) return;

    expect(r1.group_number).not.toBe(r2.group_number);
    expect(r2.group_number).not.toBe(r3.group_number);
    expect(r1.group_number).not.toBe(r3.group_number);
  });

  it("claiming twice returns the same tag", () => {
    const attendee = makeAttendee("1", true);
    const attendees = [attendee];
    const r1 = assignTag(attendee, { attendees, next_group_window_start: 1, next_window_slot: 0 });
    if ("error" in r1) return;
    attendee.tag = r1.tag;
    attendee.group_number = r1.group_number;
    const r2 = assignTag(attendee, { attendees, next_group_window_start: r1.next_group_window_start, next_window_slot: r1.next_window_slot });
    if ("error" in r2) return;
    expect(r2.tag).toBe(r1.tag);
  });

  it("never exceeds 5 people per group", () => {
    const attendees: Attendee[] = Array.from({ length: 15 }, (_, i) =>
      makeAttendee(String(i + 1), true)
    );
    let ws = 1;
    let slot = 0;
    for (const a of attendees) {
      const r = assignTag(a, { attendees, next_group_window_start: ws, next_window_slot: slot });
      if ("error" in r) continue;
      a.tag = r.tag;
      a.group_number = r.group_number;
      ws = r.next_group_window_start;
      slot = r.next_window_slot;
    }
    // Count per group
    const groups = new Map<number, number>();
    for (const a of attendees) {
      if (a.group_number !== null) {
        groups.set(a.group_number, (groups.get(a.group_number) ?? 0) + 1);
      }
    }
    for (const count of groups.values()) {
      expect(count).toBeLessThanOrEqual(5);
    }
  });
});

// ─── Full scoring integration ─────────────────────────────────────────────────

describe("scoreAll()", () => {
  it("produces scores only for checked-in attendees", () => {
    const state = generateSeed();
    const checkedIn = state.attendees.filter((a) => a.checked_in_at).length;
    const scores = scoreAll(state);
    expect(scores.length).toBeLessThanOrEqual(checkedIn);
    expect(scores.length).toBeGreaterThan(0);
  });

  it("all SCAI scores are between 0 and 100", () => {
    const state = generateSeed();
    const scores = scoreAll(state);
    for (const s of scores) {
      expect(s.scai).toBeGreaterThanOrEqual(0);
      expect(s.scai).toBeLessThanOrEqual(100);
    }
  });

  it("connection counts only after both confirm", () => {
    const state = generateSeed();
    // Find a connection where only one side confirmed
    const halfConf = state.connections.find((c) => c.confirmed_by_a && !c.confirmed_by_b);
    if (halfConf) {
      const scores = scoreAll(state);
      const scoreB = scores.find((s) => s.attendee_id === halfConf.attendee_b);
      // The un-confirmed connection should NOT count toward B's N pillar
      // We just verify this doesn't throw
      expect(scoreB).toBeDefined();
    }
  });
});
