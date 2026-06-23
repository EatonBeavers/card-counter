import { describe, it, expect } from 'vitest';
import { recommendBet, unitsForTrueCount, advantageZone } from './betEngine';
import { DEFAULT_BET_RAMPS } from '../data/betRamps';
import { DEFAULT_RULESET } from '../data/defaults';

const moderate = DEFAULT_BET_RAMPS.find((r) => r.id === 'moderate')!;

describe('betEngine', () => {
  it('selects ramp units by true count', () => {
    expect(unitsForTrueCount(moderate, -2)).toBe(1);
    expect(unitsForTrueCount(moderate, 1)).toBe(1);
    expect(unitsForTrueCount(moderate, 3)).toBe(4);
    expect(unitsForTrueCount(moderate, 99)).toBe(8); // tops out at max tier
  });

  it('classifies advantage zones', () => {
    expect(advantageZone(-1)).toBe('negative');
    expect(advantageZone(0.5)).toBe('neutral');
    expect(advantageZone(2)).toBe('positive');
    expect(advantageZone(5)).toBe('strong');
  });

  it('recommends the table minimum on negative counts', () => {
    const rec = recommendBet(-2, moderate, DEFAULT_RULESET, 5000, 0.02);
    expect(rec.amount).toBe(DEFAULT_RULESET.tableMin);
    expect(rec.zone).toBe('negative');
  });

  it('scales with the count and respects the bankroll risk cap', () => {
    // TC 5 -> 8 units * $10 = $80, bankroll cap = 2% * 5000 = $100 -> $80 ok
    const rec = recommendBet(5, moderate, DEFAULT_RULESET, 5000, 0.02);
    expect(rec.amount).toBe(80);
    expect(rec.clamped).toBe(false);

    // Tiny bankroll forces a clamp below the raw suggestion.
    const capped = recommendBet(5, moderate, DEFAULT_RULESET, 1000, 0.02);
    expect(capped.amount).toBeLessThan(80);
    expect(capped.clamped).toBe(true);
  });
});
