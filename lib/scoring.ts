/**
 * SCAI Scoring Engine — pure, no React imports.
 * All logic lives here so it can be unit-tested independently.
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
  PillarRaw,
  PillarPercentile,
  AttendeeScore,
  Persona,
  EventKPIs,
  EventState,
  PILLAR_WEIGHTS,
  SEGMENTS_IN_ORDER,
  INTENT_MATCHING_PAIRS,
  Intent,
  InterestGroup,
} from "./types";

// ─── Helper: diminishing returns ─────────────────────────────────────────────

export function dr(n: number): number {
  return n > 0 ? 1 + Math.log(n) : 0;
}

// ─── Helper: intent match check ──────────────────────────────────────────────

export function intentsMatch(a: Intent, b: Intent): boolean {
  return INTENT_MATCHING_PAIRS.some(
    ([x, y]) => (x === a && y === b) || (y === a && x === b)
  );
}

// ─── Helper: percentile rank ─────────────────────────────────────────────────

/**
 * Returns percentile ranks (0–100) for each value.
 * Ties receive the same percentile (average rank method).
 */
export function percentileRanks(values: number[]): number[] {
  const n = values.length;
  if (n === 0) return [];
  if (n === 1) return [100];

  const sorted = [...values].sort((a, b) => a - b);
  return values.map((v) => {
    // number of values strictly less than v
    const below = sorted.filter((x) => x < v).length;
    // number of values equal to v
    const equal = sorted.filter((x) => x === v).length;
    // average rank, converted to percentile
    const rank = below + (equal - 1) / 2; // 0-based midpoint rank
    return (rank / (n - 1)) * 100;
  });
}

// ─── Step 1: raw pillar values ────────────────────────────────────────────────

export function computePillarRaw(
  attendee: Attendee,
  state: EventState
): PillarRaw | null {
  if (!attendee.checked_in_at) return null; // excluded from scoring

  const totalSegmentsSoFar = state.ended_segments.length;

  // P: Presence
  const attended = state.segment_attendance.filter(
    (s) => s.attendee_id === attendee.id
  );
  const segmentsAttended = attended.length;
  const servedRefreshments = state.refreshments.some(
    (r) => r.attendee_id === attendee.id
  );
  const refreshmentSegmentEnded = state.ended_segments.includes("refreshments");

  let P: number;
  if (refreshmentSegmentEnded) {
    // We know who stayed
    P =
      0.3 * 1 + // checked in
      0.4 * (totalSegmentsSoFar > 0 ? segmentsAttended / totalSegmentsSoFar : 0) +
      0.3 * (servedRefreshments ? 1 : 0);
  } else {
    // stayedToClose unknown — drop that term
    P =
      (0.3 * 1 +
        0.4 *
          (totalSegmentsSoFar > 0
            ? segmentsAttended / totalSegmentsSoFar
            : 0)) /
      0.7;
  }

  // E: Engagement
  const myQuestions = state.questions.filter(
    (q) => q.attendee_id === attendee.id
  );
  const questionsAsked = myQuestions.length;
  const avgQuality =
    questionsAsked > 0
      ? myQuestions.reduce((s, q) => s + q.quality, 0) / questionsAsked
      : 0;
  const takeawaySubmitted = state.takeaways.some(
    (t) => t.attendee_id === attendee.id
  )
    ? 1
    : 0;
  const E =
    dr(questionsAsked) + 0.5 * avgQuality + 0.5 * takeawaySubmitted;

  // N: Networking
  const confirmedConnections = state.connections.filter(
    (c) =>
      (c.attendee_a === attendee.id || c.attendee_b === attendee.id) &&
      c.confirmed_by_a &&
      c.confirmed_by_b
  );
  const crossDisciplineConnections = confirmedConnections.filter(
    (c) => c.is_cross_discipline
  ).length;

  // group photo
  let groupPhotoConfirmed = 0;
  if (attendee.group_number !== null) {
    const groupMembers = state.attendees.filter(
      (a) => a.group_number === attendee.group_number && a.checked_in_at
    );
    const groupSize = groupMembers.length;
    const confirms = state.group_photo_confirms.filter(
      (g) => g.group_number === attendee.group_number
    );
    const threshold = groupSize < 3 ? groupSize : 3;
    if (confirms.length >= threshold) groupPhotoConfirmed = 1;
  }

  const N =
    dr(confirmedConnections.length) +
    0.5 * dr(crossDisciplineConnections) +
    0.5 * groupPhotoConfirmed;

  // M: Matching
  const intentMatches = confirmedConnections.filter(
    (c) => c.is_intent_match
  ).length;
  const M =
    0.2 * (attendee.form_complete ? 1 : 0) + dr(intentMatches);

  // F: Follow-through
  const surveys = state.surveys
    .filter((s) => s.attendee_id === attendee.id)
    .sort((a, b) => b.day - a.day); // most recent first

  let F: number | null = null;
  if (surveys.length > 0) {
    const latest = surveys[0];
    F =
      dr(latest.follow_ups_sent) +
      dr(latest.meetings_held) +
      2 * latest.outcomes.length;
  }

  return { P, E, N, M, F };
}

// ─── Step 2: normalize to percentile per pillar ───────────────────────────────

export function computePercentiles(
  rawScores: { id: string; raw: PillarRaw }[]
): Map<string, PillarPercentile> {
  const result = new Map<string, PillarPercentile>();
  const pillars = ["P", "E", "N", "M"] as const;

  for (const pillar of pillars) {
    const values = rawScores.map((s) => s.raw[pillar]);
    const ranks = percentileRanks(values);
    rawScores.forEach((s, i) => {
      const existing = result.get(s.id) ?? {
        P: 0,
        E: 0,
        N: 0,
        M: 0,
        F: null,
      };
      (existing as unknown as Record<string, number | null>)[pillar] = ranks[i];
      result.set(s.id, existing as PillarPercentile);
    });
  }

  // F percentile — only for those with data
  const withF = rawScores.filter((s) => s.raw.F !== null);
  if (withF.length > 0) {
    const fVals = withF.map((s) => s.raw.F as number);
    const fRanks = percentileRanks(fVals);
    withF.forEach((s, i) => {
      const existing = result.get(s.id)!;
      existing.F = fRanks[i];
      result.set(s.id, existing);
    });
  }

  return result;
}

// ─── Step 3: weighted SCAI score ─────────────────────────────────────────────

export function computeScai(
  pct: PillarPercentile,
  weights = PILLAR_WEIGHTS
): { scai: number; provisional: boolean } {
  const { P, E, N, M, F } = pct;
  if (F === null) {
    // provisional: re-weight P, E, N, M over 0.80
    const fMissing = weights.F;
    const factor = 1 / (1 - fMissing);
    const scai =
      factor * (weights.P * P + weights.E * E + weights.N * N + weights.M * M);
    return { scai, provisional: true };
  }
  const scai =
    weights.P * P +
    weights.E * E +
    weights.N * N +
    weights.M * M +
    weights.F * F;
  return { scai, provisional: false };
}

// ─── Step 4: persona ─────────────────────────────────────────────────────────

export function computePersona(
  pct: PillarPercentile,
  attendee: Attendee,
  confirmedConnections: Connection[]
): Persona {
  const { P, E, N, M } = pct;

  // 1. Observer: every pillar below 40
  if (P < 40 && E < 40 && N < 40 && M < 40) return "Observer";

  const pillars: Record<string, number> = { P, E, N, M };
  const highest = Object.entries(pillars).sort((a, b) => b[1] - a[1])[0][0];

  // 2. Connector: N highest
  if (highest === "N") return "Connector";

  // 3. Contributor: E highest
  if (highest === "E") return "Contributor";

  // 4. Seeker: M highest or intent with zero matches
  const intentMatchCount = confirmedConnections.filter(
    (c) => c.is_intent_match
  ).length;
  if (highest === "M" || intentMatchCount === 0) return "Seeker";

  // 5. fallback
  if (N >= 60) return "Connector";
  return "Contributor";
}

// ─── Full scoring pass ────────────────────────────────────────────────────────

export function scoreAll(
  state: EventState,
  weights = PILLAR_WEIGHTS
): AttendeeScore[] {
  const checkedIn = state.attendees.filter((a) => a.checked_in_at);

  const rawScores = checkedIn
    .map((a) => ({ id: a.id, raw: computePillarRaw(a, state)! }))
    .filter((x) => x.raw !== null);

  const percentiles = computePercentiles(rawScores);

  const scores: AttendeeScore[] = rawScores.map(({ id }) => {
    const attendee = state.attendees.find((a) => a.id === id)!;
    const pct = percentiles.get(id)!;
    const { scai, provisional } = computeScai(pct, weights);
    const confirmedConns = state.connections.filter(
      (c) =>
        (c.attendee_a === id || c.attendee_b === id) &&
        c.confirmed_by_a &&
        c.confirmed_by_b
    );
    const persona = computePersona(pct, attendee, confirmedConns);
    return {
      attendee_id: id,
      pillar_raw: rawScores.find((r) => r.id === id)!.raw,
      pillar_percentile: pct,
      scai: Math.round(scai),
      provisional,
      persona,
      rank: 0,
      total_checked_in: checkedIn.length,
    };
  });

  // assign ranks
  const sorted = [...scores].sort((a, b) => b.scai - a.scai);
  sorted.forEach((s, i) => {
    s.rank = i + 1;
  });
  scores.forEach((s) => {
    s.rank = sorted.find((r) => r.attendee_id === s.attendee_id)!.rank;
  });

  return scores;
}

// ─── Step 5: event KPIs ──────────────────────────────────────────────────────

export function computeKPIs(
  state: EventState,
  scores: AttendeeScore[]
): EventKPIs {
  const checkedIn = state.attendees.filter((a) => a.checked_in_at);
  const confirmedConns = state.connections.filter(
    (c) => c.confirmed_by_a && c.confirmed_by_b
  );

  // match rate: attendees with ≥1 intent match / attendees whose intent has a pair
  const matchableIntents = new Set<Intent>(
    INTENT_MATCHING_PAIRS.flatMap(([a, b]) => [a, b])
  );
  const matchableAttendees = checkedIn.filter(
    (a) => a.intent && matchableIntents.has(a.intent)
  );
  const withMatch = new Set<string>(
    confirmedConns
      .filter((c) => c.is_intent_match)
      .flatMap((c) => [c.attendee_a, c.attendee_b])
  );
  const match_rate =
    matchableAttendees.length > 0
      ? withMatch.size / matchableAttendees.length
      : 0;

  // cross-group links
  const cross_group_links =
    confirmedConns.length > 0
      ? confirmedConns.filter((c) => c.is_cross_discipline).length /
        confirmedConns.length
      : 0;

  // average SCAI
  const avg_scai =
    scores.length > 0
      ? scores.reduce((s, x) => s + x.scai, 0) / scores.length
      : 0;

  // NPS (day-7 surveys)
  const day7 = state.surveys.filter((s) => s.day === 7 && s.nps !== null);
  let nps: number | null = null;
  if (day7.length > 0) {
    const promoters = day7.filter((s) => (s.nps ?? 0) >= 9).length;
    const detractors = day7.filter((s) => (s.nps ?? 0) <= 6).length;
    nps = Math.round(
      ((promoters - detractors) / day7.length) * 100
    );
  }

  // avg SCAI by interest group
  const groups: InterestGroup[] = ["Science", "Technology", "Engineering", "Math"];
  const avg_scai_by_group = {} as Record<InterestGroup, number>;
  for (const g of groups) {
    const groupAttendees = checkedIn.filter((a) => a.interest_group === g);
    const groupScores = groupAttendees
      .map((a) => scores.find((s) => s.attendee_id === a.id)?.scai ?? 0);
    avg_scai_by_group[g] =
      groupScores.length > 0
        ? groupScores.reduce((a, b) => a + b, 0) / groupScores.length
        : 0;
  }

  // unmatched needs
  const allIntents: Intent[] = [
    "job_seeking",
    "hiring",
    "partner",
    "raising_capital",
    "investing",
  ];
  const unmatched_needs = {} as Record<Intent, number>;
  for (const intent of allIntents) {
    const withThisIntent = checkedIn.filter((a) => a.intent === intent);
    const unmatchedCount = withThisIntent.filter(
      (a) => !withMatch.has(a.id)
    ).length;
    unmatched_needs[intent] = unmatchedCount;
  }

  // bridgers: betweenness centrality (Brandes algorithm)
  const bridgers = computeBetweenness(state, checkedIn.map((a) => a.id));

  return {
    attendees: checkedIn.length,
    match_rate,
    cross_group_links,
    avg_scai: Math.round(avg_scai),
    nps,
    avg_scai_by_group,
    unmatched_needs,
    bridgers: bridgers.slice(0, 5),
  };
}

// ─── Brandes betweenness centrality ──────────────────────────────────────────

export function computeBetweenness(
  state: EventState,
  nodeIds: string[]
): { attendee_id: string; centrality: number }[] {
  const confirmedConns = state.connections.filter(
    (c) => c.confirmed_by_a && c.confirmed_by_b
  );

  const indexMap = new Map<string, number>();
  nodeIds.forEach((id, i) => indexMap.set(id, i));
  const n = nodeIds.length;

  // adjacency list
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const c of confirmedConns) {
    const a = indexMap.get(c.attendee_a);
    const b = indexMap.get(c.attendee_b);
    if (a !== undefined && b !== undefined) {
      adj[a].push(b);
      adj[b].push(a);
    }
  }

  const centrality = new Float64Array(n);

  for (let s = 0; s < n; s++) {
    const stack: number[] = [];
    const pred: number[][] = Array.from({ length: n }, () => []);
    const sigma = new Float64Array(n);
    sigma[s] = 1;
    const dist = new Int32Array(n).fill(-1);
    dist[s] = 0;
    const queue = [s];

    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);
      for (const w of adj[v]) {
        if (dist[w] < 0) {
          queue.push(w);
          dist[w] = dist[v] + 1;
        }
        if (dist[w] === dist[v] + 1) {
          sigma[w] += sigma[v];
          pred[w].push(v);
        }
      }
    }

    const delta = new Float64Array(n);
    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of pred[w]) {
        delta[v] += (sigma[v] / sigma[w]) * (1 + delta[w]);
      }
      if (w !== s) centrality[w] += delta[w];
    }
  }

  return nodeIds
    .map((id, i) => ({ attendee_id: id, centrality: centrality[i] }))
    .sort((a, b) => b.centrality - a.centrality);
}
