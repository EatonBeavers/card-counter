import { useStore } from '../../state/store';
import { getSystemOrDefault } from '../../data/countSystems';

export function TopBar(): JSX.Element {
  const session = useStore((s) => s.session);
  const rules = useStore((s) => s.rules);
  const newSession = useStore((s) => s.newSession);
  const system = getSystemOrDefault(session.systemId);

  return (
    <header className="topbar">
      <div className="brand">
        <span className="dot" />
        CARD&nbsp;COUNTER
      </div>

      <span className="badge accent">{system.name}</span>
      <span className="badge">
        {rules.decks}D · {Math.round(rules.penetration * 100)}% pen
      </span>
      <span className="badge">{rules.dealerHitsSoft17 ? 'H17' : 'S17'}</span>
      <span className="badge">{rules.blackjackPayout} BJ</span>

      <div className="spacer" />

      <div className="topbar-meta">
        <span className="mono">{session.name}</span>
        <button className="btn ghost sm" onClick={() => newSession()}>
          New Session
        </button>
      </div>
    </header>
  );
}
