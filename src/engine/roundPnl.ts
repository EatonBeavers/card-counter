import type { BlackjackPayout } from '../types/ruleSet';
import type { RoundOutcome } from '../types/session';

/** Player net P&L for one resolved hand (bet is the main wager, not insurance). */
export function netResultForOutcome(
  outcome: RoundOutcome,
  bet: number,
  blackjackPayout: BlackjackPayout,
): number {
  const b = Math.max(0, bet);
  switch (outcome) {
    case 'win':
      return b;
    case 'loss':
      return -b;
    case 'push':
      return 0;
    case 'blackjack':
      return b * blackjackPayoutMultiplier(blackjackPayout);
    case 'surrender':
      return -b * 0.5;
  }
}

export function blackjackPayoutMultiplier(payout: BlackjackPayout): number {
  switch (payout) {
    case '3:2':
      return 1.5;
    case '6:5':
      return 1.2;
    case '2:1':
      return 2;
    case '1:1':
      return 1;
  }
}

export const OUTCOME_LABEL: Record<RoundOutcome, string> = {
  win: 'Win',
  loss: 'Loss',
  push: 'Push',
  blackjack: 'Blackjack',
  surrender: 'Surrender',
};
