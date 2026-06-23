export type BetProfile = 'conservative' | 'moderate' | 'aggressive' | 'custom';

/** One step of a bet ramp: from this true count upward, wager `units` base units. */
export interface BetRampTier {
  /** Inclusive lower bound of true count for this tier. */
  trueCountFrom: number;
  units: number;
}

export interface BetRamp {
  id: string;
  name: string;
  profile: BetProfile;
  /** Sorted ascending by `trueCountFrom`. The lowest tier acts as the floor. */
  tiers: BetRampTier[];
}

export type AdvantageZone = 'negative' | 'neutral' | 'positive' | 'strong';

export interface BetRecommendation {
  units: number;
  /** Final wager after unit sizing, table min/max, and bankroll caps. */
  amount: number;
  /** True if the raw suggestion was clamped down to table max or bankroll cap. */
  clamped: boolean;
  zone: AdvantageZone;
  note: string;
}
