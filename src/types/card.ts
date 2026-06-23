// Card / rank / suit domain model.
//
// Ranks are collapsed to the 10 counting-relevant values: all ten-valued cards
// (10, J, Q, K) share the rank "T", which is how every counting system below
// assigns weights. Suit is tracked only for the full 52-card visual grid and
// has no effect on any count.

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T'] as const;
export type Rank = (typeof RANKS)[number];

export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
export type Suit = (typeof SUITS)[number];

export const SUIT_SYMBOL: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

/** Number of physical card faces per rank within a single 52-card deck. */
export const RANK_FACES_PER_DECK: Record<Rank, number> = {
  A: 4,
  '2': 4,
  '3': 4,
  '4': 4,
  '5': 4,
  '6': 4,
  '7': 4,
  '8': 4,
  '9': 4,
  T: 16, // 10, J, Q, K
};

export interface Card {
  rank: Rank;
  /** Optional — only populated when a card is entered via the 52-card grid. */
  suit?: Suit;
}

export const RANK_LABEL: Record<Rank, string> = {
  A: 'A',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  T: '10',
};

/** Lowercase, uppercase, and '10' all map to a canonical rank for keyboard input. */
export function parseRankKey(key: string): Rank | null {
  const k = key.toUpperCase();
  if (k === '0' || k === '10') return 'T';
  if ((RANKS as readonly string[]).includes(k)) return k as Rank;
  return null;
}
