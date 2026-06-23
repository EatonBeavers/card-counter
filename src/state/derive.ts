import { RANKS } from '../types/card';
import type { CountSystem, Rank, RuleSet, SessionState, Settings } from '../types';
import {
  cardsRemaining,
  estimateDecksRemaining,
  penetrationSeen,
  runningCount,
  trueCount,
} from '../engine';

export interface LiveStats {
  cardsSeen: number;
  cardsRemaining: number;
  decksRemaining: number;
  runningCount: number;
  trueCount: number;
  /** Fraction of shoe seen (0–1). */
  penetration: number;
  /** Count of each rank seen so far (for the full-deck grid + composition). */
  rankCounts: Record<Rank, number>;
  /** Whether decks remaining came from a manual override. */
  decksOverridden: boolean;
}

/** Pure projection of the current session/system/rules into display stats. */
export function deriveLiveStats(
  session: SessionState,
  system: CountSystem,
  rules: RuleSet,
  settings: Settings,
): LiveStats {
  const cardsSeen = session.events.length;
  const rc = runningCount(system, session.events);

  const auto = estimateDecksRemaining(rules.decks, cardsSeen, settings.deckPrecision);
  const useManual = settings.decksMode === 'manual' && session.decksRemainingOverride != null;
  const decksRemaining = useManual ? (session.decksRemainingOverride as number) : auto;

  const rankCounts = emptyRankCounts();
  for (const e of session.events) rankCounts[e.card.rank] += 1;

  return {
    cardsSeen,
    cardsRemaining: cardsRemaining(rules.decks, cardsSeen),
    decksRemaining,
    runningCount: rc,
    trueCount: trueCount(rc, decksRemaining),
    penetration: penetrationSeen(rules.decks, cardsSeen),
    rankCounts,
    decksOverridden: useManual,
  };
}

export function emptyRankCounts(): Record<Rank, number> {
  return RANKS.reduce(
    (acc, r) => {
      acc[r] = 0;
      return acc;
    },
    {} as Record<Rank, number>,
  );
}
