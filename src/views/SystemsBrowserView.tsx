import { useState } from 'react';
import { Panel } from '../components/ui/Panel';
import { COUNT_SYSTEMS, getSystemOrDefault } from '../data/countSystems';
import { useStore } from '../state/store';
import { RANKS, RANK_LABEL } from '../types/card';
import { formatCount } from '../engine';

export function SystemsBrowserView(): JSX.Element {
  const session = useStore((s) => s.session);
  const setSystem = useStore((s) => s.setSystem);
  const [selectedId, setSelectedId] = useState(session.systemId);
  const selected = getSystemOrDefault(selectedId);

  const maxAbs = Math.max(...RANKS.map((r) => Math.abs(selected.weights[r]))) || 1;

  function exportSystems(): void {
    const blob = new Blob([JSON.stringify(COUNT_SYSTEMS, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'count-systems.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="view-header">
        <div>
          <h2>Systems Browser</h2>
          <div className="sub">{COUNT_SYSTEMS.length} counting systems · click a row for per-rank weights</div>
        </div>
        <button className="btn ghost sm" onClick={exportSystems}>
          Export JSON
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16 }}>
        <Panel title="Registry">
          <table className="data">
            <thead>
              <tr>
                <th>System</th>
                <th>Category</th>
                <th className="num">PE</th>
                <th className="num">BC</th>
                <th className="num">IC</th>
                <th className="num">UPM</th>
                <th className="num">Lvl</th>
              </tr>
            </thead>
            <tbody>
              {COUNT_SYSTEMS.map((s) => (
                <tr
                  key={s.id}
                  className={`clickable${s.id === selectedId ? ' selected' : ''}`}
                  onClick={() => setSelectedId(s.id)}
                >
                  <td>
                    {s.name} {s.isPlaceholder && <span className="badge warn">PH</span>}
                  </td>
                  <td className="text-dim">{s.category}</td>
                  <td className="num">{s.metrics.pe.toFixed(2)}</td>
                  <td className="num">{s.metrics.bc.toFixed(2)}</td>
                  <td className="num">{s.metrics.ic.toFixed(2)}</td>
                  <td className="num">{s.metrics.upm.toFixed(3)}</td>
                  <td className="num">{s.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel
          title={selected.name}
          actions={
            <button className="btn primary sm" onClick={() => setSystem(selected.id)}>
              Use System
            </button>
          }
        >
          <p className="text-dim" style={{ fontSize: 13, marginTop: 0 }}>
            {selected.description}
          </p>
          <div className="btn-row" style={{ marginBottom: 12 }}>
            <span className="badge">{selected.category}</span>
            {selected.balanced && <span className="badge">balanced</span>}
            <span className="badge">{selected.aceReckoned ? 'ace-reckoned' : 'ace-neutral'}</span>
            {selected.realValued && <span className="badge">real-valued</span>}
            {selected.isPlaceholder && <span className="badge warn">placeholder</span>}
          </div>

          <div className="panel-title">Per-Rank Weights</div>
          <div className="stack" style={{ gap: 6 }}>
            {RANKS.map((r) => {
              const w = selected.weights[r];
              const pct = (Math.abs(w) / maxAbs) * 100;
              const cls = w > 0 ? 'pos' : w < 0 ? 'neg' : 'neutral';
              return (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="mono" style={{ width: 28 }}>
                    {RANK_LABEL[r]}
                  </span>
                  <div style={{ flex: 1, height: 8, background: 'var(--bg-elev)', borderRadius: 4 }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        borderRadius: 4,
                        background: w >= 0 ? 'var(--pos)' : 'var(--neg)',
                      }}
                    />
                  </div>
                  <span className={`mono ${cls}`} style={{ width: 48, textAlign: 'right' }}>
                    {formatCount(w, 'exact')}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-faint" style={{ fontSize: 11, marginTop: 12, marginBottom: 0 }}>
            {selected.notes}
          </p>
        </Panel>
      </div>
    </div>
  );
}
