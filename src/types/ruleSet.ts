// Table / shoe conditions. The count engine only strictly needs `decks` and
// `penetration`, but the rest shape betting guidance and future strategy work.

export type BlackjackPayout = '3:2' | '6:5' | '1:1' | '2:1';

export interface RuleSet {
  /** Number of 52-card decks in the shoe (1–8). */
  decks: number;
  /** Fraction of the shoe dealt before reshuffle (0–1), e.g. 0.75 = 75%. */
  penetration: number;
  dealerHitsSoft17: boolean;
  doubleAfterSplit: boolean;
  lateSurrender: boolean;
  insuranceAvailable: boolean;
  blackjackPayout: BlackjackPayout;
  /** Bankroll & table economics. */
  startingBankroll: number;
  tableMin: number;
  tableMax: number;
  /** Base betting unit (typically == tableMin). */
  unitSize: number;
}
