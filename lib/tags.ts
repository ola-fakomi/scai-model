/**
 * Tag assignment logic.
 * Pure functions — no React, no side effects.
 */

import { Attendee, EventState, MIXING_WINDOW, MAX_GROUP_SIZE } from "./types";

export const TAG_LETTERS = ["A", "B", "C", "D", "E"] as const;
export type TagLetter = (typeof TAG_LETTERS)[number];

export function parseTag(tag: string): { group: number; letter: TagLetter } | null {
  const match = tag.match(/^(\d+)([A-E])$/);
  if (!match) return null;
  return { group: parseInt(match[1], 10), letter: match[2] as TagLetter };
}

export function formatTag(group: number, letter: TagLetter): string {
  return `${group}${letter}`;
}

/** Returns the next free tag and updated window state.
 *  Returns null if the attendee is not checked in.
 */
export function assignTag(
  attendee: Attendee,
  state: Pick<EventState, "attendees" | "next_group_window_start" | "next_window_slot">
): {
  tag: string;
  group_number: number;
  next_group_window_start: number;
  next_window_slot: number;
} | { error: string } {
  if (!attendee.checked_in_at) {
    return { error: "not_checked_in" };
  }

  // Already has a tag
  if (attendee.tag) {
    return {
      tag: attendee.tag,
      group_number: attendee.group_number!,
      next_group_window_start: state.next_group_window_start,
      next_window_slot: state.next_window_slot,
    };
  }

  let windowStart = state.next_group_window_start;
  let slot = state.next_window_slot;

  // Try to assign in the current window cycling
  for (let attempt = 0; attempt < MIXING_WINDOW * MAX_GROUP_SIZE + 1; attempt++) {
    const groupNum = windowStart + slot;
    const membersInGroup = state.attendees.filter(
      (a) => a.group_number === groupNum && a.tag !== null
    );
    if (membersInGroup.length < MAX_GROUP_SIZE) {
      const letter = TAG_LETTERS[membersInGroup.length];
      const tag = formatTag(groupNum, letter);
      const nextSlot = (slot + 1) % MIXING_WINDOW;
      const nextWindowStart =
        nextSlot === 0 ? windowStart + MIXING_WINDOW : windowStart;
      return {
        tag,
        group_number: groupNum,
        next_group_window_start: nextWindowStart,
        next_window_slot: nextSlot,
      };
    }
    // This group in the window is full, advance slot
    slot = (slot + 1) % MIXING_WINDOW;
    if (slot === 0) windowStart += MIXING_WINDOW;
  }

  return { error: "no_slots" };
}

/** Check if a tag is expired relative to now. */
export function isTagExpired(tag_expires_at: string | null): boolean {
  if (!tag_expires_at) return false;
  return new Date() > new Date(tag_expires_at);
}

/** Returns 23:59:59 Africa/Lagos on a given date string. */
export function tagExpiryForDate(dateStr: string): string {
  // dateStr like "2026-11-22"
  return `${dateStr}T23:59:59+01:00`;
}

/** Returns all tags currently assigned for a given group number. */
export function getGroupTags(
  state: Pick<EventState, "attendees">,
  groupNumber: number
): Attendee[] {
  return state.attendees.filter((a) => a.group_number === groupNumber && a.tag);
}
