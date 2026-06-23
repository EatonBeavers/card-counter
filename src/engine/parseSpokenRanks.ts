import type { Rank } from '../types/card';

export type SpokenAction =
  | { type: 'card'; rank: Rank; burn: boolean }
  | { type: 'undo' }
  | { type: 'nextRound' }
  | { type: 'reset' };

const RANK_ALIASES: Record<string, Rank> = {
  a: 'A',
  ace: 'A',
  '2': '2',
  two: '2',
  deuce: '2',
  '3': '3',
  three: '3',
  '4': '4',
  four: '4',
  '5': '5',
  five: '5',
  '6': '6',
  six: '6',
  '7': '7',
  seven: '7',
  '8': '8',
  eight: '8',
  '9': '9',
  nine: '9',
  '10': 'T',
  t: 'T',
  ten: 'T',
  jack: 'T',
  j: 'T',
  queen: 'T',
  q: 'T',
  king: 'T',
  k: 'T',
};

/** Split spoken phrases like "ace, ten, four, queen" into tokens. */
export function tokenizeSpokenTranscript(transcript: string): string[] {
  return transcript
    .toLowerCase()
    .replace(/[,;]/g, ' ')
    .replace(/\band\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Map a spoken transcript into card-entry actions. */
export function parseSpokenTranscript(transcript: string): SpokenAction[] {
  const tokens = tokenizeSpokenTranscript(transcript);
  const actions: SpokenAction[] = [];
  let burnNext = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;

    if (token === 'burn') {
      burnNext = true;
      continue;
    }

    if (token === 'undo' || token === 'back' || token === 'backspace') {
      actions.push({ type: 'undo' });
      burnNext = false;
      continue;
    }

    if (token === 'reset') {
      actions.push({ type: 'reset' });
      burnNext = false;
      continue;
    }

    if (token === 'next') {
      if (tokens[i + 1] === 'round') i += 1;
      actions.push({ type: 'nextRound' });
      burnNext = false;
      continue;
    }

    const rank = RANK_ALIASES[token];
    if (rank) {
      actions.push({ type: 'card', rank, burn: burnNext });
      burnNext = false;
      continue;
    }
  }

  return actions;
}
