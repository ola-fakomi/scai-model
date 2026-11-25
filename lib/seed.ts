/**
 * Seeded sample data generator.
 * Uses mulberry32 PRNG with seed 20261122 so the demo looks the same every time.
 * Generates inputs only — scores are computed by the scoring engine.
 */

import {
  Attendee,
  SegmentAttendance,
  Question,
  Takeaway,
  Connection,
  GroupPhotoConfirm,
  Refreshment,
  Survey,
  EventState,
  InterestGroup,
  Intent,
  Segment,
  OutcomeType,
  MIXING_WINDOW,
  MAX_GROUP_SIZE,
  INTENT_MATCHING_PAIRS,
} from "./types";
import { assignTag, tagExpiryForDate } from "./tags";
import { intentsMatch } from "./scoring";

// ─── PRNG ─────────────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20261122);

function rand() {
  return rng();
}
function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

// ─── Name lists ───────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Ada", "Tobi", "Kemi", "Chidi", "Ngozi", "Femi", "Amara", "Emeka",
  "Yetunde", "Biodun", "Seun", "Nkechi", "Tunde", "Ifeanyi", "Chioma",
  "Ola", "Rotimi", "Funke", "Obinna", "Ifeoma", "Damilola", "Taiwo",
  "Kehinde", "Adaeze", "Chinonso", "Oluwaseun", "Babatunde", "Chiamaka",
  "Uchenna", "Olumide", "Nnamdi", "Abiodun", "Olajide", "Chidinma",
  "Adewale", "Olamide", "Ebuka", "Uche", "Sola", "Folake", "Yakubu",
  "Fatima", "Hauwa", "Musa", "Ibrahim", "Aisha", "Zainab", "Nasiru",
  "Halima", "Sadiq",
];

const LAST_NAMES = [
  "Okafor", "Adeyemi", "Balogun", "Eze", "Umeh", "Lawal", "Nwachukwu",
  "Abiodun", "Olawale", "Chukwu", "Fashola", "Obi", "Adesanya", "Nwosu",
  "Okonkwo", "Adeleke", "Oluwafemi", "Ezeh", "Dada", "Adekunle",
  "Musa", "Ibrahim", "Aliyu", "Suleiman", "Abdullahi", "Yusuf",
  "Abubakar", "Garba", "Idris", "Umar", "Yakubu", "Bello", "Danjuma",
  "Tanko", "Haruna", "Lawan", "Makama", "Shehu", "Dikko", "Gombe",
];

function uniqueName(usedNames: Set<string>): string {
  let attempts = 0;
  while (attempts < 200) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const full = `${first} ${last}`;
    if (!usedNames.has(full)) {
      usedNames.add(full);
      return full;
    }
    attempts++;
  }
  return `Attendee ${usedNames.size + 1}`;
}

export function shortName(name: string): string {
  const parts = name.split(" ");
  if (parts.length < 2) return name;
  return `${parts[0]} ${parts[1][0]}.`;
}

// ─── Main seed function ────────────────────────────────────────────────────────

const EVENT_DATE = "2026-11-22";
const TOTAL_REGISTERED = 210;
const CHECKED_IN_COUNT = 200;
const TAG_EXPIRY = tagExpiryForDate(EVENT_DATE);

export function generateSeed(): EventState {
  const usedNames = new Set<string>();
  const attendees: Attendee[] = [];
  const segment_attendance: SegmentAttendance[] = [];
  const questions: Question[] = [];
  const takeaways: Takeaway[] = [];
  const connection_requests: Connection[] = [];
  const connections: Connection[] = [];
  const group_photo_confirms: GroupPhotoConfirm[] = [];
  const refreshments: Refreshment[] = [];
  const surveys: Survey[] = [];

  // ── 1. Create attendees ────────────────────────────────────────────────────
  const interestGroups: InterestGroup[] = ["Science", "Technology", "Engineering", "Math"];
  const igWeights = [0.25, 0.35, 0.25, 0.15];
  const intents: Intent[] = ["job_seeking", "hiring", "partner", "raising_capital", "investing"];
  const intentWeights = [0.35, 0.15, 0.25, 0.15, 0.10];

  for (let i = 0; i < TOTAL_REGISTERED; i++) {
    const id = `att_${String(i + 1).padStart(4, "0")}`;
    const name = uniqueName(usedNames);
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
    const phone = `+234${randInt(700, 919)}${randInt(1000000, 9999999)}`;
    const luma_ticket_id = `LUMA${String(i + 1).padStart(5, "0")}`;
    const checkedIn = i < CHECKED_IN_COUNT;
    const checked_in_at = checkedIn
      ? new Date(
          new Date(`${EVENT_DATE}T08:30:00+01:00`).getTime() +
            randInt(0, 90) * 60000
        ).toISOString()
      : null;

    attendees.push({
      id,
      name,
      email,
      phone,
      luma_ticket_id,
      checked_in_at,
      tag: null,
      group_number: null,
      interest_group: null,
      intent: null,
      consent: false,
      form_complete: false,
      tag_expires_at: null,
    });
  }

  // ── 2. Assign tags (mixing rule) ──────────────────────────────────────────
  let next_group_window_start = 1;
  let next_window_slot = 0;

  const checkedInAttendees = attendees.filter((a) => a.checked_in_at);

  // 95% complete the form
  for (const attendee of checkedInAttendees) {
    const formComplete = rand() < 0.95;
    if (!formComplete) continue;

    const result = assignTag(attendee, {
      attendees,
      next_group_window_start,
      next_window_slot,
    });
    if ("error" in result) continue;

    attendee.tag = result.tag;
    attendee.group_number = result.group_number;
    attendee.interest_group = weightedPick(interestGroups, igWeights);
    attendee.intent = weightedPick(intents, intentWeights);
    attendee.consent = true;
    attendee.form_complete = true;
    attendee.tag_expires_at = TAG_EXPIRY;

    next_group_window_start = result.next_group_window_start;
    next_window_slot = result.next_window_slot;
  }

  // ── 3. Segment attendance ─────────────────────────────────────────────────
  const segmentRates: Record<string, number> = {
    keynote: 0.90,
    panel: 0.92,
    networking: 0.95,
    breakouts: 0.85,
    refreshments: 0.80,
  };
  const segmentTimes: Record<string, string> = {
    keynote: `${EVENT_DATE}T10:00:00+01:00`,
    panel: `${EVENT_DATE}T11:30:00+01:00`,
    networking: `${EVENT_DATE}T13:30:00+01:00`,
    breakouts: `${EVENT_DATE}T15:00:00+01:00`,
    refreshments: `${EVENT_DATE}T16:30:00+01:00`,
  };
  const segmentCodes: Record<string, string> = {
    keynote: "K7Q2",
    panel: "P3M8",
    networking: "N5R1",
    breakouts: "B9T4",
    refreshments: "R2V6",
  };

  const taggedAttendees = attendees.filter((a) => a.tag);

  for (const seg of ["keynote", "panel", "networking", "breakouts"] as Segment[]) {
    for (const a of taggedAttendees) {
      if (rand() < segmentRates[seg]) {
        segment_attendance.push({
          attendee_id: a.id,
          segment: seg,
          entered_at: segmentTimes[seg],
        });
      }
    }
  }

  // ── 4. Refreshments (served) ──────────────────────────────────────────────
  const refreshmentAttendees = taggedAttendees.filter(() => rand() < segmentRates.refreshments);
  for (const a of refreshmentAttendees) {
    refreshments.push({
      attendee_id: a.id,
      served_at: `${EVENT_DATE}T16:35:00+01:00`,
      served_by: "staff_usher",
    });
    segment_attendance.push({
      attendee_id: a.id,
      segment: "refreshments",
      entered_at: `${EVENT_DATE}T16:30:00+01:00`,
    });
  }

  // ── 5. Questions ──────────────────────────────────────────────────────────
  // About 25 questions total; quality distributed 1(30%), 2(45%), 3(25%)
  const questionSegments: ("keynote" | "panel")[] = ["keynote", "panel"];
  const questionQualities: (1 | 2 | 3)[] = [1, 2, 3];
  const qualityWeights = [0.30, 0.45, 0.25];
  const questionCount = 25;
  const questionAskers = taggedAttendees
    .filter(() => rand() < 0.15)
    .slice(0, questionCount);
  for (const a of questionAskers) {
    questions.push({
      id: `q_${questions.length + 1}`,
      tag: a.tag!,
      attendee_id: a.id,
      segment: pick(questionSegments),
      quality: weightedPick(questionQualities, qualityWeights),
      logged_by: "staff_notetaker",
      logged_at: `${EVENT_DATE}T11:00:00+01:00`,
    });
  }

  // ── 6. Takeaways ──────────────────────────────────────────────────────────
  const takeawayTexts = [
    "Network beyond your discipline — the best ideas live at the edges.",
    "Quality conversations beat quantity every time.",
    "Follow up within 48 hours or the connection fades.",
    "Your intent defines your outcome — be clear about what you want.",
    "STEM skills travel across every sector; never limit yourself.",
    "One real meeting is worth ten LinkedIn connections.",
    "Ask better questions — curiosity opens more doors than expertise.",
    "Find the investors at every event — they are always listening.",
    "Cross-discipline thinking is what makes engineers valuable to tech startups.",
    "The best hire you'll make could be someone you met at an event like this.",
  ];
  for (const a of taggedAttendees) {
    if (rand() < 0.60) {
      takeaways.push({
        attendee_id: a.id,
        text: pick(takeawayTexts),
        submitted_at: `${EVENT_DATE}T12:30:00+01:00`,
      });
    }
  }

  // ── 7. Connections ────────────────────────────────────────────────────────
  // Build group map
  const groupMap = new Map<number, Attendee[]>();
  for (const a of taggedAttendees) {
    if (a.group_number === null) continue;
    if (!groupMap.has(a.group_number)) groupMap.set(a.group_number, []);
    groupMap.get(a.group_number)!.push(a);
  }

  const connectionSet = new Set<string>();
  let connId = 0;

  function makeConnection(
    a: Attendee,
    b: Attendee,
    segment: "networking" | "breakouts",
    confirmed: boolean
  ) {
    const key = [a.id, b.id].sort().join("|");
    if (connectionSet.has(key)) return;
    connectionSet.add(key);

    const aGroup = a.interest_group;
    const bGroup = b.interest_group;
    const is_cross = aGroup !== null && bGroup !== null && aGroup !== bGroup;
    const isMatch =
      a.intent !== null &&
      b.intent !== null &&
      intentsMatch(a.intent, b.intent);

    connections.push({
      id: `conn_${++connId}`,
      attendee_a: a.id,
      attendee_b: b.id,
      segment,
      confirmed_by_a: confirmed,
      confirmed_by_b: confirmed,
      confirmed_at: confirmed ? `${EVENT_DATE}T14:00:00+01:00` : null,
      is_cross_discipline: is_cross,
      is_intent_match: isMatch,
    });
  }

  // Networking: each person attempts 2–4 with group members, 85% become confirmed
  const networkingAttendees = new Set(
    segment_attendance
      .filter((s) => s.segment === "networking")
      .map((s) => s.attendee_id)
  );
  for (const [, group] of groupMap) {
    for (const a of group) {
      if (!networkingAttendees.has(a.id)) continue;
      const others = group.filter((b) => b.id !== a.id);
      const attempts = randInt(2, Math.min(4, others.length));
      const targets = others.sort(() => rand() - 0.5).slice(0, attempts);
      for (const b of targets) {
        if (!networkingAttendees.has(b.id)) continue;
        const confirmed = rand() < 0.85;
        makeConnection(a, b, "networking", confirmed);
      }
    }
  }

  // Breakouts: 1–3 more each, more likely when intents match
  const breakoutAttendees = new Set(
    segment_attendance
      .filter((s) => s.segment === "breakouts")
      .map((s) => s.attendee_id)
  );
  for (const a of taggedAttendees) {
    if (!breakoutAttendees.has(a.id)) continue;
    const others = taggedAttendees.filter(
      (b) =>
        b.id !== a.id &&
        breakoutAttendees.has(b.id) &&
        b.group_number !== a.group_number
    );
    const attempts = randInt(1, 3);
    // Prefer intent matches
    const matchingOthers = others.filter(
      (b) => a.intent && b.intent && intentsMatch(a.intent, b.intent)
    );
    const targets = [
      ...matchingOthers.sort(() => rand() - 0.5).slice(0, Math.min(2, attempts)),
      ...others.sort(() => rand() - 0.5).slice(0, attempts),
    ].slice(0, attempts);
    for (const b of targets) {
      const confirmed = rand() < 0.80;
      makeConnection(a, b, "breakouts", confirmed);
    }
  }

  // ── 8. Group photos ───────────────────────────────────────────────────────
  // 90% of groups reach confirmation (≥3 members confirm, or all if <3)
  for (const [groupNum, group] of groupMap) {
    if (rand() > 0.90) continue; // skip 10% of groups
    const threshold = group.length < 3 ? group.length : 3;
    const confirmers = group
      .sort(() => rand() - 0.5)
      .slice(0, threshold);
    for (const a of confirmers) {
      group_photo_confirms.push({
        group_number: groupNum,
        attendee_id: a.id,
        confirmed_at: `${EVENT_DATE}T14:30:00+01:00`,
      });
    }
  }

  // ── 9. Day-7 surveys ─────────────────────────────────────────────────────
  // 55% respond, NPS skewed positive (target ~+40–60)
  for (const a of taggedAttendees) {
    if (rand() > 0.55) continue;
    const followUpsSent = randInt(1, 8);
    const meetingsHeld = randInt(0, Math.min(followUpsSent, 4));
    const outcomePool: OutcomeType[] = ["hire", "deal", "partnership", "investment", "other"];
    const outcomes: OutcomeType[] = [];
    for (const o of outcomePool) {
      if (rand() < 0.15) outcomes.push(o);
    }
    // NPS: skewed positive (mostly 7–10)
    const nps = weightedPick(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [0.01, 0.01, 0.01, 0.01, 0.01, 0.03, 0.05, 0.12, 0.18, 0.28, 0.29]
    );
    surveys.push({
      attendee_id: a.id,
      day: 7,
      follow_ups_sent: followUpsSent,
      meetings_held: meetingsHeld,
      outcomes,
      nps,
      submitted_at: new Date(
        new Date(`${EVENT_DATE}T10:00:00+01:00`).getTime() + 7 * 86400000
      ).toISOString(),
    });
  }

  return {
    attendees,
    segment_attendance,
    questions,
    takeaways,
    connection_requests: [],
    connections,
    group_photo_confirms,
    refreshments,
    surveys,
    active_segment: null,
    ended_segments: [
      "keynote",
      "panel",
      "networking",
      "breakouts",
      "refreshments",
    ],
    photo_time_active: false,
    next_group_window_start,
    next_window_slot,
  };
}

/** Minimal initial state (no event started) */
export function initialState(): EventState {
  const seed = generateSeed();
  // Reset dynamic fields — start fresh
  return {
    ...seed,
    // reset attendance so "Simulate" can re-run them
    segment_attendance: [],
    questions: [],
    takeaways: [],
    connections: [],
    group_photo_confirms: [],
    refreshments: [],
    surveys: [],
    active_segment: null,
    ended_segments: [],
    photo_time_active: false,
    // Keep attendees without tags so the demo starts clean
    attendees: seed.attendees.map((a) => ({
      ...a,
      tag: null,
      group_number: null,
      interest_group: null,
      intent: null,
      consent: false,
      form_complete: false,
      tag_expires_at: null,
      checked_in_at: null,
    })),
    next_group_window_start: 1,
    next_window_slot: 0,
  };
}

export { generateSeed as simulateFullEvent };
