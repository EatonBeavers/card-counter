import type { BetRamp } from '../types';

// Data-driven bet ramps. `trueCountFrom` is the inclusive lower bound; the
// engine picks the highest tier whose threshold the current true count meets.
// Edit freely or build your own in the Bet Ramp Editor (persisted in settings).

export const DEFAULT_BET_RAMPS: BetRamp[] = [
  {
    id: 'conservative',
    name: 'Conservative (1–4 spread)',
    profile: 'conservative',
    tiers: [
      { trueCountFrom: -99, units: 1 },
      { trueCountFrom: 1, units: 1 },
      { trueCountFrom: 2, units: 2 },
      { trueCountFrom: 3, units: 3 },
      { trueCountFrom: 4, units: 4 },
    ],
  },
  {
    id: 'moderate',
    name: 'Moderate (1–8 spread)',
    profile: 'moderate',
    tiers: [
      { trueCountFrom: -99, units: 1 },
      { trueCountFrom: 1, units: 1 },
      { trueCountFrom: 2, units: 2 },
      { trueCountFrom: 3, units: 4 },
      { trueCountFrom: 4, units: 6 },
      { trueCountFrom: 5, units: 8 },
    ],
  },
  {
    id: 'aggressive',
    name: 'Aggressive (1–16 spread)',
    profile: 'aggressive',
    tiers: [
      { trueCountFrom: -99, units: 1 },
      { trueCountFrom: 1, units: 2 },
      { trueCountFrom: 2, units: 4 },
      { trueCountFrom: 3, units: 8 },
      { trueCountFrom: 4, units: 12 },
      { trueCountFrom: 5, units: 16 },
    ],
  },
];

export const DEFAULT_BET_RAMP_ID = 'moderate';
