import type { RuleSet, Settings } from '../types';
import { DEFAULT_BET_RAMP_ID } from './betRamps';

export const DEFAULT_RULESET: RuleSet = {
  decks: 6,
  penetration: 0.75,
  dealerHitsSoft17: false,
  doubleAfterSplit: true,
  lateSurrender: false,
  insuranceAvailable: true,
  blackjackPayout: '3:2',
  startingBankroll: 5000,
  tableMin: 10,
  tableMax: 1000,
  unitSize: 10,
};

export const DEFAULT_SETTINGS: Settings = {
  defaultDecks: 6,
  defaultSystemId: 'hi-lo',
  displayPrecision: 'oneDecimal',
  deckPrecision: 'half',
  decksMode: 'auto',
  theme: 'dark',
  feedbackEnabled: true,
  defaultBetRampId: DEFAULT_BET_RAMP_ID,
  bankrollRiskFraction: 0.02,
  keyBindings: {
    undo: 'Backspace',
    reset: 'r',
    nextRound: 'Enter',
    toggleInsurance: 'i',
    burnToggle: 'b',
  },
};
