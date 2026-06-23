import type { DeckPrecision } from '../types';

export const CARDS_PER_DECK = 52;

/** Smallest decks-remaining we will divide by, to keep true count finite. */
export const MIN_DECKS_REMAINING = 0.25;

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function cardsRemaining(totalDecks: number, cardsSeen: number): number {
  return Math.max(0, totalDecks * CARDS_PER_DECK - cardsSeen);
}

/**
 * Estimated decks remaining from cards seen, rounded to the chosen precision.
 * Floored at MIN_DECKS_REMAINING so true-count division stays well defined.
 */
export function estimateDecksRemaining(
  totalDecks: number,
  cardsSeen: number,
  precision: DeckPrecision,
): number {
  const raw = cardsRemaining(totalDecks, cardsSeen) / CARDS_PER_DECK;
  const step = precision === 'full' ? 1 : precision === 'half' ? 0.5 : 0.25;
  const rounded = roundTo(raw, step);
  return Math.max(MIN_DECKS_REMAINING, rounded);
}

/** Fraction of the shoe seen so far (0–1). */
export function penetrationSeen(totalDecks: number, cardsSeen: number): number {
  const total = totalDecks * CARDS_PER_DECK;
  return total === 0 ? 0 : Math.min(1, cardsSeen / total);
}

/** True once seen fraction reaches the configured penetration (reshuffle point). */
export function penetrationReached(
  totalDecks: number,
  cardsSeen: number,
  penetration: number,
): boolean {
  return penetrationSeen(totalDecks, cardsSeen) >= penetration;
}
