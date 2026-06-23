import { Panel } from '../ui/Panel';
import { useLiveStats } from '../../hooks/useLiveStats';
import { useStore } from '../../state/store';

/** Decks-remaining estimate with auto/manual override (quarter-deck steps). */
export function DecksPanel(): JSX.Element {
  const decksMode = useStore((s) => s.settings.decksMode);
  const updateSettings = useStore((s) => s.updateSettings);
  const setDecksOverride = useStore((s) => s.setDecksOverride);
  const session = useStore((s) => s.session);
  const totalDecks = useStore((s) => s.rules.decks);
  const { stats } = useLiveStats();

  const manual = decksMode === 'manual';
  const overrideValue = session.decksRemainingOverride ?? stats.decksRemaining;

  return (
    <Panel
      title="Deck Estimation"
      actions={
        <div className="segmented">
          <button
            className={!manual ? 'active' : ''}
            onClick={() => updateSettings({ decksMode: 'auto' })}
          >
            Auto
          </button>
          <button
            className={manual ? 'active' : ''}
            onClick={() => {
              updateSettings({ decksMode: 'manual' });
              if (session.decksRemainingOverride == null) setDecksOverride(stats.decksRemaining);
            }}
          >
            Manual
          </button>
        </div>
      }
    >
      <div className="stat-grid">
        <div className="stat-cell">
          <div className="label">Remaining</div>
          <div className="value">{stats.decksRemaining}</div>
        </div>
        <div className="stat-cell">
          <div className="label">Cards Left</div>
          <div className="value">{stats.cardsRemaining}</div>
        </div>
      </div>

      {manual && (
        <div className="field" style={{ marginTop: 12, marginBottom: 0 }}>
          <label>
            Override: <span className="mono">{overrideValue}</span> decks
          </label>
          <input
            type="range"
            min={0.25}
            max={totalDecks}
            step={0.25}
            value={overrideValue}
            onChange={(e) => setDecksOverride(Number(e.target.value))}
          />
        </div>
      )}
    </Panel>
  );
}
