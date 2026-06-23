import { describe, it, expect } from 'vitest';
import { parseSpokenTranscript, tokenizeSpokenTranscript } from './parseSpokenRanks';

describe('parseSpokenRanks', () => {
  it('tokenizes comma-separated card names', () => {
    expect(tokenizeSpokenTranscript('Ace, ten, four, queen')).toEqual([
      'ace',
      'ten',
      'four',
      'queen',
    ]);
  });

  it('maps spoken card names to ranks', () => {
    expect(parseSpokenTranscript('ace ten four queen')).toEqual([
      { type: 'card', rank: 'A', burn: false },
      { type: 'card', rank: 'T', burn: false },
      { type: 'card', rank: '4', burn: false },
      { type: 'card', rank: 'T', burn: false },
    ]);
  });

  it('maps face cards and number words', () => {
    expect(parseSpokenTranscript('jack king deuce nine')).toEqual([
      { type: 'card', rank: 'T', burn: false },
      { type: 'card', rank: 'T', burn: false },
      { type: 'card', rank: '2', burn: false },
      { type: 'card', rank: '9', burn: false },
    ]);
  });

  it('supports burn prefix', () => {
    expect(parseSpokenTranscript('burn ace five')).toEqual([
      { type: 'card', rank: 'A', burn: true },
      { type: 'card', rank: '5', burn: false },
    ]);
  });

  it('supports voice commands', () => {
    expect(parseSpokenTranscript('ace undo ten next round')).toEqual([
      { type: 'card', rank: 'A', burn: false },
      { type: 'undo' },
      { type: 'card', rank: 'T', burn: false },
      { type: 'nextRound' },
    ]);
  });
});
