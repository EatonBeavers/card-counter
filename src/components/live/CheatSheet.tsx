import { useStore } from '../../state/store';

interface CheatSheetProps {
  onClose: () => void;
}

export function CheatSheet({ onClose }: CheatSheetProps): JSX.Element {
  const kb = useStore((s) => s.settings.keyBindings);

  const rows: Array<[string, string]> = [
    ['Add card', 'A · 2–9 · 0 or T'],
    ['Voice entry', 'Mic button — say "ace, ten, four, queen"'],
    ['Burn card', 'Shift + rank · or say "burn ace"'],
    ['Undo last card', kb.undo],
    ['Next round', kb.nextRound],
    ['Reset shoe', kb.reset],
    ['Toggle insurance', kb.toggleInsurance],
    ['Close this sheet', 'Esc or ?'],
  ];

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 12 }}>Keyboard Shortcuts</h3>
        {rows.map(([label, key]) => (
          <div className="shortcut-row" key={label}>
            <span className="text-dim">{label}</span>
            <span className="kbd">{key}</span>
          </div>
        ))}
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button className="btn primary sm" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
