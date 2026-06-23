import { defineSystem } from './defineSystem';
import type { CountSystem, RankWeights } from '../../types';

// ===========================================================================
//  ⚠️  PLACEHOLDER REAL-VALUED WEIGHTS  ⚠️
// ===========================================================================
//  RV Count #91–#94 are AI-evolved, real-valued systems. The per-rank weight
//  tables below are PLACEHOLDERS so the app runs end-to-end today. They are
//  NOT the real evolved weights.
//
//  >>> TO INSTALL THE REAL WEIGHTS: edit the `weights` object of each entry in
//  >>> the RV_PLACEHOLDER_WEIGHTS map below. Keep `isPlaceholder: true` until a
//  >>> table is real, then flip it to false. Nothing else needs to change —
//  >>> realValued / balanced / level are derived automatically.
//
//  The published metrics (PE/BC/IC/UPM) ARE the supplied real values and are
//  left intact regardless of placeholder weights.
// ===========================================================================

const SHARED_METRICS = { pe: 0.7, bc: 0.98, ic: 0.94, upm: 0.9733333333333332 } as const;

/** Replace these objects with the actual evolved weights when available. */
export const RV_PLACEHOLDER_WEIGHTS: Record<string, RankWeights> = {
  'rv-91': { A: -1.0, '2': 0.5, '3': 0.7, '4': 0.9, '5': 1.1, '6': 0.8, '7': 0.4, '8': 0.0, '9': -0.3, T: -1.0 },
  'rv-92': { A: -1.0, '2': 0.6, '3': 0.7, '4': 0.9, '5': 1.0, '6': 0.8, '7': 0.3, '8': 0.1, '9': -0.4, T: -1.0 },
  'rv-93': { A: -0.9, '2': 0.5, '3': 0.8, '4': 1.0, '5': 1.1, '6': 0.7, '7': 0.4, '8': 0.0, '9': -0.3, T: -1.0 },
  'rv-94': { A: -1.0, '2': 0.5, '3': 0.7, '4': 1.0, '5': 1.2, '6': 0.8, '7': 0.3, '8': 0.0, '9': -0.4, T: -1.0 },
};

const RV_DEFS: Array<{ id: string; name: string }> = [
  { id: 'rv-94', name: 'RV Count #94' },
  { id: 'rv-91', name: 'RV Count #91' },
  { id: 'rv-92', name: 'RV Count #92' },
  { id: 'rv-93', name: 'RV Count #93' },
];

export const REAL_VALUED_SYSTEMS: CountSystem[] = RV_DEFS.map(({ id, name }) =>
  defineSystem({
    id,
    name,
    category: 'AI-evolved / real-valued',
    description: `${name} — AI-evolved real-valued count. Placeholder weights pending the evolved table.`,
    tags: ['real-valued', 'ai-evolved', 'placeholder'],
    weights: RV_PLACEHOLDER_WEIGHTS[id]!,
    metrics: { ...SHARED_METRICS },
    realValued: true,
    isPlaceholder: true,
    notes:
      'PLACEHOLDER weights — see src/data/countSystems/realValued.ts to install the real evolved table. Metrics are the supplied real values.',
  }),
);
