import { describe, it, expect } from 'vitest';
import { computeSessionSummary } from './sessionAnalytics';
import type { SessionMeta, SessionState } from '../types';

const meta: SessionMeta = {
  rules: {
    decks: 6,
    penetration: 0.75,
    dealerHitsSoft17: true,
    doubleAfterSplit: true,
    lateSurrender: false,
    insuranceAvailable: true,
    blackjackPayout: '3:2',
    startingBankroll: 10000,
    tableMin: 25,
    tableMax: 500,
    unitSize: 25,
  },
  settings: {
    displayPrecision: 'nearestHalf',
    deckPrecision: 'quarter',
    decksMode: 'auto',
    bankrollRiskFraction: 0.02,
  },
  betRamp: {
    id: 'moderate',
    name: 'Moderate',
    profile: 'moderate',
    tiers: [
      { trueCountFrom: -99, units: 1 },
      { trueCountFrom: 1, units: 2 },
      { trueCountFrom: 2, units: 4 },
      { trueCountFrom: 3, units: 8 },
    ],
  },
  systemId: 'hi-lo',
  systemName: 'Hi-Lo',
  sessionType: 'practice',
};

function sessionWithHistory(
  history: SessionState['history'],
  events: SessionState['events'] = [],
): SessionState {
  return {
    id: 's1',
    name: 'Test',
    createdAt: 1,
    updatedAt: 2,
    systemId: 'hi-lo',
    events,
    history,
    round: 2,
    decksRemainingOverride: null,
    sessionType: 'practice',
    shoeResets: 0,
  };
}

describe('computeSessionSummary', () => {
  it('returns zeros for empty history', () => {
    const s = computeSessionSummary(sessionWithHistory([]), meta);
    expect(s.cardsSeen).toBe(0);
    expect(s.edgeProxy).toBe(0);
  });

  it('computes peak TC and zone distribution', () => {
    const history = [
      { at: 1000, cardsSeen: 1, runningCount: -1, trueCount: -0.5, decksRemaining: 6 },
      { at: 2000, cardsSeen: 2, runningCount: 2, trueCount: 2.5, decksRemaining: 5.9 },
      { at: 3000, cardsSeen: 3, runningCount: 4, trueCount: 4, decksRemaining: 5.8 },
    ];
    const s = computeSessionSummary(sessionWithHistory(history), meta);
    expect(s.peakTrueCount).toBe(4);
    expect(s.lowTrueCount).toBe(-0.5);
    expect(s.zoneDistribution.strong).toBe(1);
    expect(s.zoneDistribution.positive).toBe(1);
    expect(s.durationMs).toBe(2000);
    expect(s.tcStrongPct).toBeCloseTo(33.33, 0);
  });

  it('counts rounds and burn cards from events', () => {
    const events = [
      { id: '1', card: { rank: 'A' as const }, at: 1, round: 0, burn: false },
      { id: '2', card: { rank: 'T' as const }, at: 2, round: 1, burn: true },
    ];
    const history = [
      { at: 1, cardsSeen: 1, runningCount: -1, trueCount: -1, decksRemaining: 6 },
      { at: 2, cardsSeen: 2, runningCount: 0, trueCount: 0, decksRemaining: 6 },
    ];
    const s = computeSessionSummary(sessionWithHistory(history, events), meta);
    expect(s.roundsPlayed).toBe(2);
    expect(s.burnCards).toBe(1);
  });
});
