import { getSystemOrDefault } from '../data/countSystems';
import type {
  AdvantageZone,
  SessionMeta,
  SessionState,
  SessionSummary,
} from '../types';
import { advantageZone, recommendBet } from './betEngine';

const TC_HIST_MIN = -5;
const TC_HIST_MAX = 8;

function emptyZoneDistribution(): Record<AdvantageZone, number> {
  return { negative: 0, neutral: 0, positive: 0, strong: 0 };
}

function emptyHistogram(): Array<{ tc: number; count: number }> {
  const buckets: Array<{ tc: number; count: number }> = [];
  for (let tc = TC_HIST_MIN; tc <= TC_HIST_MAX; tc++) buckets.push({ tc, count: 0 });
  return buckets;
}

function tcBucket(trueCount: number): number {
  return Math.max(TC_HIST_MIN, Math.min(TC_HIST_MAX, Math.floor(trueCount)));
}

function roundsFromEvents(session: SessionState): number {
  if (session.events.length === 0) return 0;
  return Math.max(...session.events.map((e) => e.round)) + 1;
}

function shoesPlayed(session: SessionState): number {
  return (session.shoeResets ?? 0) + (session.events.length > 0 ? 1 : 0);
}

/** Derive session analytics from the card log and frozen table context. */
export function computeSessionSummary(session: SessionState, meta: SessionMeta): SessionSummary {
  const history = session.history;
  const system = getSystemOrDefault(meta.systemId);

  if (history.length === 0) {
    return {
      cardsSeen: 0,
      roundsPlayed: 0,
      shoesPlayed: 0,
      burnCards: 0,
      durationMs: 0,
      peakTrueCount: 0,
      lowTrueCount: 0,
      peakRunningCount: 0,
      lowRunningCount: 0,
      avgTrueCount: 0,
      maxPenetration: 0,
      zoneDistribution: emptyZoneDistribution(),
      tcPositivePct: 0,
      tcStrongPct: 0,
      edgeProxy: 0,
      totalRecommendedWager: 0,
      avgRecommendedBet: 0,
      tcHistogram: emptyHistogram(),
    };
  }

  const trueCounts = history.map((h) => h.trueCount);
  const runningCounts = history.map((h) => h.runningCount);
  const zoneDistribution = emptyZoneDistribution();
  const histogram = emptyHistogram();
  let totalRecommendedWager = 0;
  let positiveTcSum = 0;
  let positiveCount = 0;
  let strongCount = 0;

  for (const snap of history) {
    const zone = advantageZone(snap.trueCount);
    zoneDistribution[zone]++;
    histogram[tcBucket(snap.trueCount) - TC_HIST_MIN]!.count++;

    if (snap.trueCount > 0) {
      positiveCount++;
      positiveTcSum += snap.trueCount;
    }
    if (snap.trueCount >= 3) strongCount++;

    const bet = recommendBet(
      snap.trueCount,
      meta.betRamp,
      meta.rules,
      meta.rules.startingBankroll,
      meta.settings.bankrollRiskFraction,
    );
    totalRecommendedWager += bet.amount;
  }

  const last = history[history.length - 1]!;
  const totalCards = meta.rules.decks * 52;
  const maxPenetration = totalCards > 0 ? last.cardsSeen / totalCards : 0;

  const avgPositiveTc = positiveCount > 0 ? positiveTcSum / positiveCount : 0;
  const positiveRate = positiveCount / history.length;
  const edgeProxy = system.metrics.bc * avgPositiveTc * positiveRate;

  return {
    cardsSeen: last.cardsSeen,
    roundsPlayed: roundsFromEvents(session),
    shoesPlayed: shoesPlayed(session),
    burnCards: session.events.filter((e) => e.burn).length,
    durationMs: history.length > 1 ? last.at - history[0]!.at : 0,
    peakTrueCount: Math.max(...trueCounts),
    lowTrueCount: Math.min(...trueCounts),
    peakRunningCount: Math.max(...runningCounts),
    lowRunningCount: Math.min(...runningCounts),
    avgTrueCount: trueCounts.reduce((a, b) => a + b, 0) / trueCounts.length,
    maxPenetration,
    zoneDistribution,
    tcPositivePct: (positiveCount / history.length) * 100,
    tcStrongPct: (strongCount / history.length) * 100,
    edgeProxy,
    totalRecommendedWager,
    avgRecommendedBet: totalRecommendedWager / history.length,
    tcHistogram: histogram,
  };
}
