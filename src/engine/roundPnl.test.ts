import { describe, it, expect } from 'vitest';
import { netResultForOutcome } from './roundPnl';

describe('roundPnl', () => {
  it('computes even-money win and loss', () => {
    expect(netResultForOutcome('win', 100, '3:2')).toBe(100);
    expect(netResultForOutcome('loss', 100, '3:2')).toBe(-100);
    expect(netResultForOutcome('push', 100, '3:2')).toBe(0);
  });

  it('respects blackjack payout rules', () => {
    expect(netResultForOutcome('blackjack', 100, '3:2')).toBe(150);
    expect(netResultForOutcome('blackjack', 100, '6:5')).toBe(120);
  });

  it('computes late surrender as half bet lost', () => {
    expect(netResultForOutcome('surrender', 100, '3:2')).toBe(-50);
  });
});
