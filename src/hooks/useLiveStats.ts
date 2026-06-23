import { useMemo } from 'react';
import { useStore } from '../state/store';
import { deriveLiveStats } from '../state/derive';
import { getSystemOrDefault } from '../data/countSystems';
import { recommendBet } from '../engine';
import type { BetRecommendation, CountSystem } from '../types';
import type { LiveStats } from '../state/derive';

export interface LiveView {
  system: CountSystem;
  stats: LiveStats;
  recommendation: BetRecommendation;
}

/** Single source of derived live-count data for the dashboard and side panels. */
export function useLiveStats(): LiveView {
  const session = useStore((s) => s.session);
  const rules = useStore((s) => s.rules);
  const settings = useStore((s) => s.settings);
  const ramps = useStore((s) => s.ramps);
  const activeRampId = useStore((s) => s.activeRampId);

  return useMemo(() => {
    const system = getSystemOrDefault(session.systemId);
    const stats = deriveLiveStats(session, system, rules, settings);
    const ramp = ramps.find((r) => r.id === activeRampId) ?? ramps[0]!;
    const recommendation = recommendBet(
      stats.trueCount,
      ramp,
      rules,
      rules.startingBankroll,
      settings.bankrollRiskFraction,
    );
    return { system, stats, recommendation };
  }, [session, rules, settings, ramps, activeRampId]);
}
