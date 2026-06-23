export type DisplayPrecision = 'exact' | 'oneDecimal' | 'nearestHalf' | 'nearestInteger';
export type ThemeMode = 'dark' | 'light';
export type DecksMode = 'auto' | 'manual';

/** Quarter-deck granularity for decks-remaining rounding. */
export type DeckPrecision = 'full' | 'half' | 'quarter';

export interface KeyBindings {
  undo: string;
  reset: string;
  nextRound: string;
  toggleInsurance: string;
  burnToggle: string;
}

export interface Settings {
  defaultDecks: number;
  defaultSystemId: string;
  displayPrecision: DisplayPrecision;
  deckPrecision: DeckPrecision;
  decksMode: DecksMode;
  theme: ThemeMode;
  feedbackEnabled: boolean;
  defaultBetRampId: string;
  /** Bankroll fraction ceiling for any single wager (Kelly-ish guard), e.g. 0.02. */
  bankrollRiskFraction: number;
  keyBindings: KeyBindings;
}
