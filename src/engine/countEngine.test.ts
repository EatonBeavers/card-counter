import { describe, it, expect } from 'vitest';
import { runningCount, trueCount, cardValue } from './countEngine';
import { estimateDecksRemaining, penetrationSeen } from './deckEstimator';
import { getSystemOrDefault } from '../data/countSystems';
import type { CardEntryEvent, Rank } from '../types';

const hiLo = getSystemOrDefault('hi-lo');
const wong = getSystemOrDefault('wong-halves');

function events(ranks: Rank[]): CardEntryEvent[] {
  return ranks.map((rank, i) => ({
    id: String(i),
    card: { rank },
    at: i,
    round: 0,
    burn: false,
  }));
}

describe('countEngine', () => {
  it('assigns Hi-Lo values correctly', () => {
    expect(cardValue(hiLo, '5')).toBe(1);
    expect(cardValue(hiLo, 'T')).toBe(-1);
    expect(cardValue(hiLo, 'A')).toBe(-1);
    expect(cardValue(hiLo, '8')).toBe(0);
  });

  it('sums a running count', () => {
    // 2,3,4 -> +3 ; T,A -> -2 ; net +1
    expect(runningCount(hiLo, events(['2', '3', '4', 'T', 'A']))).toBe(1);
  });

  it('handles real-valued (fractional) sums without float dust', () => {
    // Wong Halves: 2(+0.5) 7(+0.5) 9(-0.5) = +0.5
    expect(runningCount(wong, events(['2', '7', '9']))).toBe(0.5);
  });

  it('computes true count as running / decks remaining', () => {
    expect(trueCount(6, 3)).toBe(2);
    expect(trueCount(3, 1.5)).toBe(2);
  });

  it('never divides by zero decks remaining', () => {
    expect(Number.isFinite(trueCount(10, 0))).toBe(true);
  });
});

describe('deckEstimator', () => {
  it('estimates decks remaining at half-deck precision', () => {
    // 6 decks, 26 cards seen -> 5.5 remaining
    expect(estimateDecksRemaining(6, 26, 'half')).toBe(5.5);
  });

  it('rounds at quarter-deck precision', () => {
    // 6 decks, 13 cards seen -> 5.75 remaining
    expect(estimateDecksRemaining(6, 13, 'quarter')).toBe(5.75);
  });

  it('reports penetration seen', () => {
    expect(penetrationSeen(2, 52)).toBeCloseTo(0.5);
  });
});

describe('balanced metadata', () => {
  it('marks Hi-Lo balanced and ace-reckoned', () => {
    expect(hiLo.balanced).toBe(true);
    expect(hiLo.aceReckoned).toBe(true);
  });

  it('detects real-valued systems', () => {
    expect(wong.realValued).toBe(true);
    expect(hiLo.realValued).toBe(false);
  });
});
