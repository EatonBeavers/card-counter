import { useStore } from '../../state/store';
import type { ViewId } from '../../state/store';

const ITEMS: Array<{ id: ViewId; glyph: string; label: string }> = [
  { id: 'live', glyph: '⊕', label: 'Live' },
  { id: 'systems', glyph: '▦', label: 'Systems' },
  { id: 'ramps', glyph: '⊿', label: 'Ramp' },
  { id: 'history', glyph: '☷', label: 'Sessions' },
  { id: 'settings', glyph: '⚙', label: 'Config' },
  { id: 'about', glyph: '♥', label: 'About' },
];

export function SideNav(): JSX.Element {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);

  return (
    <nav className="nav">
      {ITEMS.map((item) => (
        <button
          key={item.id}
          className={view === item.id ? 'active' : ''}
          onClick={() => setView(item.id)}
          title={item.label}
        >
          <span className="glyph">{item.glyph}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
