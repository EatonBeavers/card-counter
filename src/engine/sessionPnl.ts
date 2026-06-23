import type { RoundRecord, SessionState } from '../types/session';
import { netResultForOutcome } from './roundPnl';

export function sessionBankroll(session: SessionState, startingBankroll: number): number {
  const pnl = session.roundOutcomes.reduce((sum, r) => sum + r.netResult, 0);
  return startingBankroll + pnl;
}

export interface PnlStats {
  handsLogged: number;
  wins: number;
  losses: number;
  pushes: number;
  blackjacks: number;
  surrenders: number;
  netPnL: number;
  totalWagered: number;
  roi: number;
  winRate: number;
  endingBankroll: number;
  maxDrawdown: number;
}

export function computePnlStats(
  roundOutcomes: RoundRecord[],
  startingBankroll: number,
): PnlStats {
  if (roundOutcomes.length === 0) {
    return {
      handsLogged: 0,
      wins: 0,
      losses: 0,
      pushes: 0,
      blackjacks: 0,
      surrenders: 0,
      netPnL: 0,
      totalWagered: 0,
      roi: 0,
      winRate: 0,
      endingBankroll: startingBankroll,
      maxDrawdown: 0,
    };
  }

  let wins = 0;
  let losses = 0;
  let pushes = 0;
  let blackjacks = 0;
  let surrenders = 0;
  let netPnL = 0;
  let totalWagered = 0;

  for (const r of roundOutcomes) {
    netPnL += r.netResult;
    totalWagered += r.bet;
    switch (r.outcome) {
      case 'win':
        wins++;
        break;
      case 'loss':
        losses++;
        break;
      case 'push':
        pushes++;
        break;
      case 'blackjack':
        blackjacks++;
        break;
      case 'surrender':
        surrenders++;
        break;
    }
  }

  const decided = wins + losses + surrenders + blackjacks;
  const winRate = decided > 0 ? (wins + blackjacks) / decided : 0;
  const roi = totalWagered > 0 ? netPnL / totalWagered : 0;

  const sorted = [...roundOutcomes].sort((a, b) => a.at - b.at);
  let bankroll = startingBankroll;
  let peak = startingBankroll;
  let maxDrawdown = 0;
  for (const r of sorted) {
    bankroll += r.netResult;
    peak = Math.max(peak, bankroll);
    maxDrawdown = Math.max(maxDrawdown, peak - bankroll);
  }

  return {
    handsLogged: roundOutcomes.length,
    wins,
    losses,
    pushes,
    blackjacks,
    surrenders,
    netPnL,
    totalWagered,
    roi,
    winRate,
    endingBankroll: startingBankroll + netPnL,
    maxDrawdown,
  };
}

/** Build a round record; net P&L derived from outcome and table rules. */
export function buildRoundRecord(
  round: number,
  outcome: RoundRecord['outcome'],
  bet: number,
  trueCount: number,
  runningCount: number,
  blackjackPayout: Parameters<typeof netResultForOutcome>[2],
  id: string,
): RoundRecord {
  return {
    id,
    round,
    at: Date.now(),
    outcome,
    bet,
    netResult: netResultForOutcome(outcome, bet, blackjackPayout),
    trueCount,
    runningCount,
  };
}
