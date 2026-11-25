"use client";
/**
 * Zustand store for the SCAI demo.
 * Persisted to localStorage so a refresh doesn't wipe state.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  EventState,
  Attendee,
  Segment,
  Intent,
  InterestGroup,
  Connection,
  OutcomeType,
  SurveyDay,
  MIXING_WINDOW,
  SEGMENTS_IN_ORDER,
} from "./types";
import { assignTag } from "./tags";
import { simulateFullEvent, initialState } from "./seed";
import { intentsMatch } from "./scoring";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function nowIso(): string {
  return new Date().toISOString();
}

function uuid(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export interface DemoStore extends EventState {
  // ── Active attendee (for "Act as attendee" picker) ──
  active_attendee_id: string | null;
  setActiveAttendee: (id: string | null) => void;

  // ── Luma / check-in ──────────────────────────────────
  checkIn: (attendeeId: string) => void;
  registerWalkIn: (name: string, email: string, phone: string) => string; // returns new id

  // ── Tag claim ─────────────────────────────────────────
  claimTag: (attendeeId: string, interestGroup: InterestGroup, intent: Intent, consent: boolean) => { tag: string } | { error: string };

  // ── Segment control ───────────────────────────────────
  startSegment: (segment: Segment) => string; // returns code
  endSegment: (segment: Segment) => void;
  enterSegmentCode: (attendeeId: string, code: string) => boolean; // true if accepted
  triggerPhotoTime: () => void;

  // ── Questions ─────────────────────────────────────────
  logQuestion: (tag: string, segment: "keynote" | "panel", quality: 1 | 2 | 3, loggedBy: string) => void;
  undoLastQuestion: () => void;

  // ── Takeaways ─────────────────────────────────────────
  submitTakeaway: (attendeeId: string, text: string) => void;

  // ── Connections ───────────────────────────────────────
  sendConnectionRequest: (fromId: string, toId: string, segment: "networking" | "breakouts") => void;
  confirmConnection: (connectionId: string, attendeeId: string) => void;

  // ── Group photos ──────────────────────────────────────
  confirmGroupPhoto: (attendeeId: string) => void;

  // ── Refreshments ─────────────────────────────────────
  serveRefreshment: (attendeeId: string, servedBy: string) => { error?: string };

  // ── Surveys ───────────────────────────────────────────
  submitSurvey: (attendeeId: string, day: SurveyDay, followUpsSent: number, meetingsHeld: number, outcomes: OutcomeType[], nps: number | null) => void;

  // ── Demo controls ─────────────────────────────────────
  simulateEvent: () => void;
  resetDemo: () => void;

  // ── Tag expiry toggle (demo) ──────────────────────────
  jumpToAfterMidnight: boolean;
  setJumpToAfterMidnight: (v: boolean) => void;
}

const BLANK: EventState = {
  attendees: [],
  segment_attendance: [],
  questions: [],
  takeaways: [],
  connection_requests: [],
  connections: [],
  group_photo_confirms: [],
  refreshments: [],
  surveys: [],
  active_segment: null,
  ended_segments: [],
  photo_time_active: false,
  next_group_window_start: 1,
  next_window_slot: 0,
};

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      ...initialState(),
      active_attendee_id: null,
      jumpToAfterMidnight: false,

      setActiveAttendee: (id) => set({ active_attendee_id: id }),

      setJumpToAfterMidnight: (v) => set({ jumpToAfterMidnight: v }),

      checkIn: (attendeeId) =>
        set((s) => ({
          attendees: s.attendees.map((a) =>
            a.id === attendeeId && !a.checked_in_at
              ? { ...a, checked_in_at: nowIso() }
              : a
          ),
        })),

      registerWalkIn: (name, email, phone) => {
        const id = `walkin_${uuid()}`;
        const newAttendee: Attendee = {
          id,
          name,
          email,
          phone,
          luma_ticket_id: `LUMA_WI_${id}`,
          checked_in_at: nowIso(),
          tag: null,
          group_number: null,
          interest_group: null,
          intent: null,
          consent: false,
          form_complete: false,
          tag_expires_at: null,
        };
        set((s) => ({ attendees: [...s.attendees, newAttendee] }));
        return id;
      },

      claimTag: (attendeeId, interestGroup, intent, consent) => {
        const s = get();
        const attendee = s.attendees.find((a) => a.id === attendeeId);
        if (!attendee) return { error: "Attendee not found." };
        if (!consent) return { error: "Consent is required." };

        // Already has a tag
        if (attendee.tag) return { tag: attendee.tag };

        const result = assignTag(attendee, s);
        if ("error" in result) {
          if (result.error === "not_checked_in")
            return { error: "You are not checked in yet. Please see the check-in desk." };
          return { error: "Could not assign tag. Please see the desk." };
        }

        const expiresAt = (() => {
          const d = new Date();
          d.setHours(23, 59, 59, 999);
          return d.toISOString();
        })();

        set((prev) => ({
          attendees: prev.attendees.map((a) =>
            a.id === attendeeId
              ? {
                  ...a,
                  tag: result.tag,
                  group_number: result.group_number,
                  interest_group: interestGroup,
                  intent,
                  consent,
                  form_complete: true,
                  tag_expires_at: expiresAt,
                }
              : a
          ),
          next_group_window_start: result.next_group_window_start,
          next_window_slot: result.next_window_slot,
        }));
        return { tag: result.tag };
      },

      startSegment: (segment) => {
        const code = generateCode();
        set({
          active_segment: { segment, code, started_at: nowIso() },
          photo_time_active: false,
        });
        return code;
      },

      endSegment: (segment) =>
        set((s) => ({
          ended_segments: s.ended_segments.includes(segment)
            ? s.ended_segments
            : [...s.ended_segments, segment],
          active_segment:
            s.active_segment?.segment === segment ? null : s.active_segment,
        })),

      enterSegmentCode: (attendeeId, code) => {
        const s = get();
        if (!s.active_segment) return false;
        if (s.active_segment.code !== code.toUpperCase()) return false;
        const seg = s.active_segment.segment;
        // idempotent
        const already = s.segment_attendance.some(
          (sa) => sa.attendee_id === attendeeId && sa.segment === seg
        );
        if (already) return true;
        set((prev) => ({
          segment_attendance: [
            ...prev.segment_attendance,
            { attendee_id: attendeeId, segment: seg, entered_at: nowIso() },
          ],
        }));
        return true;
      },

      triggerPhotoTime: () => set({ photo_time_active: true }),

      logQuestion: (tag, segment, quality, loggedBy) => {
        const attendee = get().attendees.find((a) => a.tag === tag);
        if (!attendee) return;
        set((s) => ({
          questions: [
            ...s.questions,
            {
              id: `q_${uuid()}`,
              tag,
              attendee_id: attendee.id,
              segment,
              quality,
              logged_by: loggedBy,
              logged_at: nowIso(),
            },
          ],
        }));
      },

      undoLastQuestion: () =>
        set((s) => ({ questions: s.questions.slice(0, -1) })),

      submitTakeaway: (attendeeId, text) => {
        const existing = get().takeaways.find((t) => t.attendee_id === attendeeId);
        if (existing) return;
        set((s) => ({
          takeaways: [
            ...s.takeaways,
            { attendee_id: attendeeId, text, submitted_at: nowIso() },
          ],
        }));
      },

      sendConnectionRequest: (fromId, toId, segment) => {
        const s = get();
        const key = [fromId, toId].sort().join("|");
        const existing = s.connections.find(
          (c) =>
            [c.attendee_a, c.attendee_b].sort().join("|") === key
        );
        if (existing) return;

        const a = s.attendees.find((x) => x.id === fromId);
        const b = s.attendees.find((x) => x.id === toId);
        const is_cross =
          a?.interest_group !== null &&
          b?.interest_group !== null &&
          a?.interest_group !== b?.interest_group;
        const is_intent_match =
          a?.intent !== null &&
          b?.intent !== null &&
          intentsMatch(a!.intent!, b!.intent!);

        set((prev) => ({
          connections: [
            ...prev.connections,
            {
              id: `conn_${uuid()}`,
              attendee_a: fromId,
              attendee_b: toId,
              segment,
              confirmed_by_a: true,
              confirmed_by_b: false,
              confirmed_at: null,
              is_cross_discipline: is_cross,
              is_intent_match,
            },
          ],
        }));
      },

      confirmConnection: (connectionId, attendeeId) =>
        set((s) => ({
          connections: s.connections.map((c) => {
            if (c.id !== connectionId) return c;
            const isA = c.attendee_a === attendeeId;
            const isB = c.attendee_b === attendeeId;
            const confirmed_by_a = c.confirmed_by_a || isA;
            const confirmed_by_b = c.confirmed_by_b || isB;
            return {
              ...c,
              confirmed_by_a,
              confirmed_by_b,
              confirmed_at:
                confirmed_by_a && confirmed_by_b ? nowIso() : c.confirmed_at,
            };
          }),
        })),

      confirmGroupPhoto: (attendeeId) => {
        const s = get();
        const attendee = s.attendees.find((a) => a.id === attendeeId);
        if (!attendee?.group_number) return;
        const already = s.group_photo_confirms.some(
          (g) =>
            g.group_number === attendee.group_number &&
            g.attendee_id === attendeeId
        );
        if (already) return;
        set((prev) => ({
          group_photo_confirms: [
            ...prev.group_photo_confirms,
            {
              group_number: attendee.group_number!,
              attendee_id: attendeeId,
              confirmed_at: nowIso(),
            },
          ],
        }));
      },

      serveRefreshment: (attendeeId, servedBy) => {
        const s = get();
        const already = s.refreshments.some((r) => r.attendee_id === attendeeId);
        if (already) {
          const r = s.refreshments.find((r) => r.attendee_id === attendeeId)!;
          return {
            error: `Already served at ${new Date(r.served_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}`,
          };
        }
        const attendee = s.attendees.find((a) => a.id === attendeeId);
        if (!attendee?.checked_in_at) return { error: "Attendee not checked in." };
        set((prev) => ({
          refreshments: [
            ...prev.refreshments,
            { attendee_id: attendeeId, served_at: nowIso(), served_by: servedBy },
          ],
        }));
        // also log segment attendance for refreshments
        const alreadyLogged = s.segment_attendance.some(
          (sa) => sa.attendee_id === attendeeId && sa.segment === "refreshments"
        );
        if (!alreadyLogged) {
          set((prev) => ({
            segment_attendance: [
              ...prev.segment_attendance,
              { attendee_id: attendeeId, segment: "refreshments", entered_at: nowIso() },
            ],
          }));
        }
        return {};
      },

      submitSurvey: (attendeeId, day, followUpsSent, meetingsHeld, outcomes, nps) => {
        set((s) => ({
          surveys: [
            ...s.surveys.filter(
              (sv) => !(sv.attendee_id === attendeeId && sv.day === day)
            ),
            {
              attendee_id: attendeeId,
              day,
              follow_ups_sent: followUpsSent,
              meetings_held: meetingsHeld,
              outcomes,
              nps,
              submitted_at: nowIso(),
            },
          ],
        }));
      },

      simulateEvent: () => {
        const full = simulateFullEvent();
        set({ ...full, active_attendee_id: null, jumpToAfterMidnight: false });
      },

      resetDemo: () =>
        set({ ...initialState(), active_attendee_id: null, jumpToAfterMidnight: false }),
    }),
    {
      name: "scai-demo-store",
      version: 1,
    }
  )
);
