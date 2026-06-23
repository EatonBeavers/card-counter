import { useEffect, useState } from 'react';
import { CardEntryPanel } from '../components/live/CardEntryPanel';
import { CountDashboard } from '../components/live/CountDashboard';
import { BettingPanel } from '../components/live/BettingPanel';
import { DecksPanel } from '../components/live/DecksPanel';
import { SystemInfoPanel } from '../components/live/SystemInfoPanel';
import { InsurancePanel } from '../components/live/InsurancePanel';
import { RoundOutcomePanel } from '../components/live/RoundOutcomePanel';
import { SessionLogPanel } from '../components/live/SessionLogPanel';
import { CheatSheet } from '../components/live/CheatSheet';
import { useKeyboardInput } from '../hooks/useKeyboardInput';

export function LiveCountView(): JSX.Element {
  const [showCheat, setShowCheat] = useState(false);
  useKeyboardInput(!showCheat);

  // '?' opens the shortcut sheet; Esc closes it. Kept here so it works app-wide
  // on the live view without colliding with rank entry.
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      const editable = (e.target as HTMLElement)?.tagName;
      if (editable === 'INPUT' || editable === 'SELECT' || editable === 'TEXTAREA') return;
      if (e.key === '?') {
        e.preventDefault();
        setShowCheat((v) => !v);
      } else if (e.key === 'Escape') {
        setShowCheat(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="live-grid">
      <div className="col-left">
        <CardEntryPanel />
      </div>

      <div className="col-center">
        <CountDashboard />
      </div>

      <div className="col-right">
        <div className="stack">
          <BettingPanel />
          <RoundOutcomePanel />
          <InsurancePanel />
          <DecksPanel />
          <SystemInfoPanel />
        </div>
      </div>

      <div className="row-bottom">
        <SessionLogPanel />
      </div>

      {showCheat && <CheatSheet onClose={() => setShowCheat(false)} />}
    </div>
  );
}
