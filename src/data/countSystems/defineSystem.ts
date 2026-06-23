import { RANK_FACES_PER_DECK, RANKS } from '../../types/card';
import type { CountSystem, RankWeights } from '../../types';

const EPS = 1e-9;

/** Full-deck weighted sum; zero (within tolerance) means the system is balanced. */
export function deckSum(weights: RankWeights): number {
  return RANKS.reduce((acc, r) => acc + weights[r] * RANK_FACES_PER_DECK[r], 0);
}

export function isRealValued(weights: RankWeights): boolean {
  return RANKS.some((r) => !Number.isInteger(weights[r]));
}

export function maxLevel(weights: RankWeights): number {
  return RANKS.reduce((m, r) => Math.max(m, Math.abs(weights[r])), 0);
}

type DefineInput = Omit<
  CountSystem,
  'realValued' | 'aceReckoned' | 'balanced' | 'level' | 'isPlaceholder'
> & {
  realValued?: boolean;
  isPlaceholder?: boolean;
};

/**
 * Builds a CountSystem, deriving `realValued`, `aceReckoned`, `balanced`, and
 * `level` from the weights so seed files only declare the source-of-truth data.
 */
export function defineSystem(input: DefineInput): CountSystem {
  const { weights } = input;
  return {
    ...input,
    realValued: input.realValued ?? isRealValued(weights),
    aceReckoned: Math.abs(weights.A) > EPS,
    balanced: Math.abs(deckSum(weights)) < EPS,
    level: maxLevel(weights),
    isPlaceholder: input.isPlaceholder ?? false,
  };
}
