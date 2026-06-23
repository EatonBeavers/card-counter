import type { AdvantageZone, BetRamp, BetRecommendation, RuleSet } from '../types';

/** Units to wager for a given true count, per the ramp's tiers. */
export function unitsForTrueCount(ramp: BetRamp, trueCount: number): number {
  let units = ramp.tiers.length ? ramp.tiers[0]!.units : 1;
  for (const tier of ramp.tiers) {
    if (trueCount >= tier.trueCountFrom) units = tier.units;
  }
  return units;
}

export function advantageZone(trueCount: number): AdvantageZone {
  if (trueCount < 0) return 'negative';
  if (trueCount < 1) return 'neutral';
  if (trueCount < 3) return 'positive';
  return 'strong';
}

/**
 * Recommends a wager from the true count and table economics:
 *   raw = units * unitSize, then clamped to [tableMin, tableMax] and to a
 *   bankroll-risk ceiling (fraction of current bankroll).
 */
export function recommendBet(
  trueCount: number,
  ramp: BetRamp,
  rules: RuleSet,
  bankroll: number,
  bankrollRiskFraction: number,
): BetRecommendation {
  const zone = advantageZone(trueCount);
  const units = unitsForTrueCount(ramp, trueCount);
  const raw = units * rules.unitSize;

  const bankrollCap = Math.max(rules.tableMin, Math.floor(bankroll * bankrollRiskFraction));
  const ceiling = Math.min(rules.tableMax, bankrollCap);
  const amount = Math.max(rules.tableMin, Math.min(raw, ceiling));
  const clamped = amount < raw;

  return { units, amount, clamped, zone, note: buildNote(zone, clamped, ceiling, raw) };
}

function buildNote(zone: AdvantageZone, clamped: boolean, ceiling: number, raw: number): string {
  if (zone === 'negative') return 'Negative count — bet the minimum or sit out / Wong out.';
  if (zone === 'neutral') return 'No edge — flat-bet the minimum.';
  if (clamped) {
    return raw > ceiling
      ? `Capped at ${ceiling} by table max / bankroll risk limit.`
      : 'Wager adjusted to table limits.';
  }
  return zone === 'strong' ? 'Strong advantage — press your bet.' : 'Slight edge — scale up.';
}
