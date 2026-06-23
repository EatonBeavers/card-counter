import { Panel } from '../ui/Panel';
import { useStore } from '../../state/store';
import { COUNT_SYSTEMS, getSystemOrDefault } from '../../data/countSystems';

export function SystemInfoPanel(): JSX.Element {
  const session = useStore((s) => s.session);
  const setSystem = useStore((s) => s.setSystem);
  const setView = useStore((s) => s.setView);
  const system = getSystemOrDefault(session.systemId);

  return (
    <Panel
      title="Count System"
      actions={
        <button className="btn ghost sm" onClick={() => setView('systems')}>
          Browse
        </button>
      }
    >
      <div className="field" style={{ marginBottom: 10 }}>
        <select value={system.id} onChange={(e) => setSystem(e.target.value)}>
          {COUNT_SYSTEMS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="btn-row" style={{ marginBottom: 10 }}>
        <span className="badge">{system.category}</span>
        {system.balanced && <span className="badge">balanced</span>}
        <span className="badge">{system.aceReckoned ? 'ace-reckoned' : 'ace-neutral'}</span>
        {system.realValued && <span className="badge">real-valued</span>}
        {system.isPlaceholder && <span className="badge warn">placeholder</span>}
      </div>

      <div className="stat-grid">
        {(['pe', 'bc', 'ic', 'upm'] as const).map((k) => (
          <div className="stat-cell" key={k}>
            <div className="label">{k.toUpperCase()}</div>
            <div className="value">{system.metrics[k].toFixed(2)}</div>
          </div>
        ))}
      </div>

      <p className="text-faint" style={{ fontSize: 11, marginBottom: 0 }}>
        {system.notes}
      </p>
    </Panel>
  );
}
