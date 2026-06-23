import type { SessionState } from '../types';

let counter = 0;

/** Reasonably unique id without pulling in a uuid dependency. */
export function makeId(prefix = 'id'): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

export function createSession(systemId: string, name?: string): SessionState {
  const now = Date.now();
  return {
    id: makeId('sess'),
    name: name ?? defaultSessionName(now),
    createdAt: now,
    updatedAt: now,
    systemId,
    events: [],
    history: [],
    round: 0,
    decksRemainingOverride: null,
    sessionType: 'practice',
    shoeResets: 0,
    roundOutcomes: [],
  };
}

function defaultSessionName(at: number): string {
  return `Session ${new Date(at).toLocaleString()}`;
}
