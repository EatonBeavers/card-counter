import type { CardEntryEvent, CountSystem, Rank } from '../types';
import { MIN_DECKS_REMAINING } from './deckEstimator';

/** Point value a system assigns to a rank. */
export function cardValue(system: CountSystem, rank: Rank): number {
  return system.weights[rank];
}

/**
 * Running count = sum of card values over all entered cards. Burn cards still
 * count: they are physically removed from the shoe and affect composition.
 *
 * A small rounding pass keeps floating-point real-valued sums clean (e.g. avoids
 * 0.30000000000000004 from accumulating fractional weights).
 */
export function runningCount(system: CountSystem, events: CardEntryEvent[]): number {
  const sum = events.reduce((acc, e) => acc + cardValue(system, e.card.rank), 0);
  return cleanFloat(sum);
}

/**
 * True count = running count / decks remaining. Division is floored at
 * MIN_DECKS_REMAINING so a nearly-exhausted shoe can't produce an infinite TC.
 */
export function trueCount(running: number, decksRemaining: number): number {
  const d = Math.max(MIN_DECKS_REMAINING, decksRemaining);
  return cleanFloat(running / d);
}

/** Strip binary-float dust while preserving meaningful real-valued precision. */
export function cleanFloat(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}
