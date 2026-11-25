/**
 * Luma interface and mock implementation.
 */

import { Attendee } from "./types";

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  luma_ticket_id: string;
}

export interface LumaClient {
  getGuestByTicket(ticketId: string): Promise<Guest | null>;
  getGuestByEmail(email: string): Promise<Guest | null>;
  isCheckedIn(guestId: string): Promise<boolean>;
  checkIn(guestId: string): Promise<void>;
  registerWalkIn(name: string, email: string, phone: string): Promise<Guest>;
}

/** Mock implementation backed by the in-memory attendee list. */
export class MockLumaClient implements LumaClient {
  private attendees: Attendee[];
  private checkedInIds: Set<string>;
  private onCheckIn: (guestId: string) => void;
  private onRegister: (attendee: Omit<Attendee, "tag" | "group_number" | "interest_group" | "intent" | "consent" | "form_complete" | "tag_expires_at">) => void;

  constructor(
    attendees: Attendee[],
    onCheckIn: (guestId: string) => void,
    onRegister: (attendee: Omit<Attendee, "tag" | "group_number" | "interest_group" | "intent" | "consent" | "form_complete" | "tag_expires_at">) => void
  ) {
    this.attendees = attendees;
    this.checkedInIds = new Set(
      attendees.filter((a) => a.checked_in_at).map((a) => a.id)
    );
    this.onCheckIn = onCheckIn;
    this.onRegister = onRegister;
  }

  private toGuest(a: Attendee): Guest {
    return {
      id: a.id,
      name: a.name,
      email: a.email,
      phone: a.phone,
      luma_ticket_id: a.luma_ticket_id,
    };
  }

  async getGuestByTicket(ticketId: string): Promise<Guest | null> {
    const a = this.attendees.find((a) => a.luma_ticket_id === ticketId);
    return a ? this.toGuest(a) : null;
  }

  async getGuestByEmail(email: string): Promise<Guest | null> {
    const a = this.attendees.find(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    );
    return a ? this.toGuest(a) : null;
  }

  async isCheckedIn(guestId: string): Promise<boolean> {
    return this.checkedInIds.has(guestId);
  }

  async checkIn(guestId: string): Promise<void> {
    this.checkedInIds.add(guestId);
    this.onCheckIn(guestId);
  }

  async registerWalkIn(
    name: string,
    email: string,
    phone: string
  ): Promise<Guest> {
    const id = `walkin_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const ticketId = `LUMA_WI_${id}`;
    const newAttendee = {
      id,
      name,
      email,
      phone,
      luma_ticket_id: ticketId,
      checked_in_at: new Date().toISOString(),
    };
    this.onRegister(newAttendee);
    this.checkedInIds.add(id);
    return {
      id,
      name,
      email,
      phone,
      luma_ticket_id: ticketId,
    };
  }
}
