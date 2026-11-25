// ─── Domain types ───────────────────────────────────────────────────────────

export type InterestGroup = "Science" | "Technology" | "Engineering" | "Math";
export type Intent =
  | "job_seeking"
  | "hiring"
  | "partner"
  | "raising_capital"
  | "investing";
export type Segment =
  | "keynote"
  | "panel"
  | "networking"
  | "breakouts"
  | "refreshments";
export type Persona =
  | "Observer"
  | "Connector"
  | "Contributor"
  | "Seeker";
export type SurveyDay = 7 | 30 | 90;
export type OutcomeType = "hire" | "deal" | "partnership" | "investment" | "other";

// ─── Config ──────────────────────────────────────────────────────────────────

export const MIXING_WINDOW = 5;
export const MAX_GROUP_SIZE = 5;
export const SEGMENTS_IN_ORDER: Segment[] = [
  "keynote",
  "panel",
  "networking",
  "breakouts",
  "refreshments",
];

export const INTENT_MATCHING_PAIRS: [Intent, Intent][] = [
  ["job_seeking", "hiring"],
  ["raising_capital", "investing"],
  ["partner", "partner"],
];

export const PILLAR_WEIGHTS = {
  P: 0.10,
  E: 0.15,
  N: 0.25,
  M: 0.30,
  F: 0.20,
} as const;

export const INTENT_LABELS: Record<Intent, string> = {
  job_seeking: "Find a job",
  hiring: "Hiring",
  partner: "Find a business partner",
  raising_capital: "Raise capital",
  investing: "Offering capital / investing",
};

export const INTEREST_GROUP_COLORS: Record<InterestGroup, string> = {
  Science: "#10b981",
  Technology: "#3b82f6",
  Engineering: "#f59e0b",
  Math: "#8b5cf6",
};

// ─── Tables ───────────────────────────────────────────────────────────────────

export interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  luma_ticket_id: string;
  checked_in_at: string | null;
  tag: string | null; // e.g. "1D"
  group_number: number | null;
  interest_group: InterestGroup | null;
  intent: Intent | null;
  consent: boolean;
  form_complete: boolean;
  tag_expires_at: string | null;
}

export interface SegmentAttendance {
  attendee_id: string;
  segment: Segment;
  entered_at: string;
}

export interface Question {
  id: string;
  tag: string;
  attendee_id: string;
  segment: "keynote" | "panel";
  quality: 1 | 2 | 3;
  logged_by: string;
  logged_at: string;
}

export interface Takeaway {
  attendee_id: string;
  text: string;
  submitted_at: string;
}

export interface ConnectionRequest {
  id: string;
  from_attendee_id: string;
  to_attendee_id: string;
  segment: "networking" | "breakouts";
  created_at: string;
}

export interface Connection {
  id: string;
  attendee_a: string;
  attendee_b: string;
  segment: "networking" | "breakouts";
  confirmed_by_a: boolean;
  confirmed_by_b: boolean;
  confirmed_at: string | null;
  is_cross_discipline: boolean;
  is_intent_match: boolean;
}

export interface GroupPhotoConfirm {
  group_number: number;
  attendee_id: string;
  confirmed_at: string;
}

export interface Refreshment {
  attendee_id: string;
  served_at: string;
  served_by: string;
}

export interface Survey {
  attendee_id: string;
  day: SurveyDay;
  follow_ups_sent: number;
  meetings_held: number;
  outcomes: OutcomeType[];
  nps: number | null; // only day 7
  submitted_at: string;
}

// ─── Scoring types ────────────────────────────────────────────────────────────

export interface PillarRaw {
  P: number;
  E: number;
  N: number;
  M: number;
  F: number | null; // null = pending
}

export interface PillarPercentile {
  P: number;
  E: number;
  N: number;
  M: number;
  F: number | null;
}

export interface AttendeeScore {
  attendee_id: string;
  pillar_raw: PillarRaw;
  pillar_percentile: PillarPercentile;
  scai: number;
  provisional: boolean;
  persona: Persona;
  rank: number; // 1 = highest
  total_checked_in: number;
}

// ─── Event state ─────────────────────────────────────────────────────────────

export interface ActiveSegment {
  segment: Segment;
  code: string;
  started_at: string;
}

export interface EventState {
  attendees: Attendee[];
  segment_attendance: SegmentAttendance[];
  questions: Question[];
  takeaways: Takeaway[];
  connection_requests: ConnectionRequest[];
  connections: Connection[];
  group_photo_confirms: GroupPhotoConfirm[];
  refreshments: Refreshment[];
  surveys: Survey[];
  active_segment: ActiveSegment | null;
  ended_segments: Segment[];
  photo_time_active: boolean;
  next_group_window_start: number; // for mixing rule
  next_window_slot: number; // 0..MIXING_WINDOW-1
}

// ─── KPIs ─────────────────────────────────────────────────────────────────────

export interface EventKPIs {
  attendees: number;
  match_rate: number; // 0–1
  cross_group_links: number; // 0–1
  avg_scai: number;
  nps: number | null; // e.g. +52
  avg_scai_by_group: Record<InterestGroup, number>;
  unmatched_needs: Record<Intent, number>;
  bridgers: { attendee_id: string; centrality: number }[];
}
