import { CLASSIC_SYSTEMS } from './classic';
import { REAL_VALUED_SYSTEMS } from './realValued';
import type { CountSystem } from '../../types';

// The pluggable count-system registry. To add a system, drop it into one of the
// seed files (or import/export JSON) — UI and engine consume only this list.
export const COUNT_SYSTEMS: CountSystem[] = [...REAL_VALUED_SYSTEMS, ...CLASSIC_SYSTEMS];

const BY_ID = new Map(COUNT_SYSTEMS.map((s) => [s.id, s]));

export function getSystem(id: string): CountSystem | undefined {
  return BY_ID.get(id);
}

/** Falls back to Hi-Lo, then the first registered system, so the UI never breaks. */
export function getSystemOrDefault(id: string | undefined): CountSystem {
  return (id ? BY_ID.get(id) : undefined) ?? BY_ID.get('hi-lo') ?? COUNT_SYSTEMS[0]!;
}

export { CLASSIC_SYSTEMS, REAL_VALUED_SYSTEMS };
export { RV_PLACEHOLDER_WEIGHTS } from './realValued';
