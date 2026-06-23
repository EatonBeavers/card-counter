import type { Rank } from './card';

/** Per-rank point values. May be non-integer for real-valued / fractional systems. */
export type RankWeights = Record<Rank, number>;

/** Performance metrics as supplied per system. */
export interface CountSystemMetrics {
  /** Playing Efficiency. */
  pe: number;
  /** Betting Correlation. */
  bc: number;
  /** Insurance Correlation. */
  ic: number;
  /** Unified Performance Metric (composite). */
  upm: number;
}

export type CountCategory = 'Classic integer' | 'AI-evolved / real-valued';

export interface CountSystem {
  id: string;
  name: string;
  category: CountCategory;
  description: string;
  tags: string[];
  weights: RankWeights;
  metrics: CountSystemMetrics;
  /** True when any non-integer weight exists; drives precision handling/UI. */
  realValued: boolean;
  /** True when the ace carries a non-zero weight (ace-reckoned vs ace-neutral). */
  aceReckoned: boolean;
  /** True when the full-deck weighted sum is zero (true count is meaningful directly). */
  balanced: boolean;
  /** Max absolute weight magnitude — a rough "level"/difficulty signal. */
  level: number;
  /** Free-form practicality / complexity notes. */
  notes: string;
  /** Marks seed weights that are not yet the real values (RV #91–#94). */
  isPlaceholder: boolean;
}
