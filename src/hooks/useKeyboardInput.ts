import { useEffect } from 'react';
import { useStore } from '../state/store';
import { parseRankKey } from '../types/card';

/**
 * Global keyboard workflow for the Live Count view. Rank keys (A,2–9,0/T) add a
 * card; configurable hotkeys handle undo / reset / next round / insurance / burn.
 * Holding the burn modifier (configured key) flags the next rank as a burn card.
 *
 * Ignores keystrokes while typing in inputs so settings fields stay usable.
 */
export function useKeyboardInput(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    function isEditable(el: EventTarget | null): boolean {
      const node = el as HTMLElement | null;
      if (!node) return false;
      const tag = node.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable;
    }

    function onKeyDown(e: KeyboardEvent): void {
      if (isEditable(e.target)) return;
      const s = useStore.getState();
      const kb = s.settings.keyBindings;
      const key = e.key;

      // Hotkeys first (so e.g. Backspace/Enter aren't treated as ranks).
      if (matches(key, kb.undo)) return done(e, () => s.undoCard());
      if (matches(key, kb.reset)) return done(e, () => s.resetShoe());
      if (matches(key, kb.nextRound)) return done(e, () => s.nextRound());
      if (matches(key, kb.toggleInsurance)) return done(e, () => s.toggleInsurancePrompt());

      const rank = parseRankKey(key);
      if (rank) {
        // Burn modifier: hold the burn key (or Shift) while pressing a rank.
        const burn = e.getModifierState?.('Shift') === true;
        return done(e, () => (burn ? s.addBurnCard(rank) : s.addCard(rank)));
      }
    }

    function matches(key: string, binding: string): boolean {
      return key.toLowerCase() === binding.toLowerCase();
    }

    function done(e: KeyboardEvent, fn: () => void): void {
      e.preventDefault();
      fn();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
