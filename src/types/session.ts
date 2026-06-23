import type { Card } from './card';
import type { AdvantageZone, BetRamp } from './betRamp';
import type { RuleSet } from './ruleSet';
import type { Settings } from './settings';

/** A single dealt-card event in the running session log. */
export interface CardEntryEvent {
  id: string;
  card: Card;
  /** epoch ms */
  at: number;
  /** Round index this card belonged to (0-based). */
  round: number;
  /** Marks a burn / dealer hole card that is seen but flagged distinctly. */
  burn: boolean;
}

/** Immutable point-in-time snapshot of the count, recorded per card entry. */
export interface CountSnapshot {
  /** epoch ms */
  at: number;
  cardsSeen: number;
  runningCount: number;
  trueCount: number;
  decksRemaining: number;
}

export type SessionType = 'practice' | 'live' | 'simulation';

export interface SessionState {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  /** Active counting system id. */
  systemId: string;
  /** Ordered card-entry log (most recent last). */
  events: CardEntryEvent[];
  /** Count history, one snapshot per entry (parallel to `events`). */
  history: CountSnapshot[];
  /** Current round index. */
  round: number;
  /** Manual override for decks remaining; null means auto-estimate. */
  decksRemainingOverride: number | null;
  /** Optional table / session context. */
  venue?: string;
  notes?: string;
  sessionType: SessionType;
  /** Incremented each time the shoe is reset mid-session. */
  shoeResets: number;
}

/** Frozen table + betting context captured when a session is saved. */
export interface SessionMeta {
  rules: RuleSet;
  settings: Pick<Settings, 'displayPrecision' | 'deckPrecision' | 'decksMode' | 'bankrollRiskFraction'>;
  betRamp: BetRamp;
  systemId: string;
  systemName: string;
  venue?: string;
  notes?: string;
  sessionType: SessionType;
}

/** Precomputed analytics for profitable-play review. */
export interface SessionSummary {
  cardsSeen: number;
  roundsPlayed: number;
  shoesPlayed: number;
  burnCards: number;
  durationMs: number;
  peakTrueCount: number;
  lowTrueCount: number;
  peakRunningCount: number;
  lowRunningCount: number;
  avgTrueCount: number;
  maxPenetration: number;
  zoneDistribution: Record<AdvantageZone, number>;
  /** % of card snapshots with TC > 0 */
  tcPositivePct: number;
  /** % of card snapshots with TC >= 3 */
  tcStrongPct: number;
  /** Betting Correlation × avg positive TC × positive-rate — edge proxy */
  edgeProxy: number;
  totalRecommendedWager: number;
  avgRecommendedBet: number;
  /** TC bucket histogram (integer floor TC, clamped −5..+8) */
  tcHistogram: Array<{ tc: number; count: number }>;
}

/** Full saved session package written to disk / local database. */
export interface SessionRecord {
  version: 1;
  savedAt: number;
  session: SessionState;
  meta: SessionMeta;
  summary: SessionSummary;
}

/** Lightweight row for the session database table. */
export interface SessionListItem {
  name: string;
  savedAt: number;
  sessionType: SessionType;
  venue?: string;
  systemId: string;
  systemName: string;
  cardsSeen: number;
  roundsPlayed: number;
  peakTrueCount: number;
  edgeProxy: number;
  durationMs: number;
  maxPenetration: number;
  tcStrongPct: number;
}
