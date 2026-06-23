import { useMemo, useState } from 'react';
import { formatCount, formatMoney } from '../../engine';
import type { DisplayPrecision, SessionListItem } from '../../types';
import { Panel } from '../ui/Panel';

type SortKey = keyof Pick<
  SessionListItem,
  | 'savedAt'
  | 'peakTrueCount'
  | 'edgeProxy'
  | 'cardsSeen'
  | 'tcStrongPct'
  | 'maxPenetration'
  | 'netPnL'
  | 'winRate'
>;

interface Props {
  items: SessionListItem[];
  precision: DisplayPrecision;
  selectedName: string | null;
  onSelect: (name: string) => void;
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
}

function formatDate(ms: number): string {
  if (!ms) return '—';
  return new Date(ms).toLocaleString();
}

export function SessionDatabaseTable({
  items,
  precision,
  selectedName,
  onSelect,
  onLoad,
  onDelete,
}: Props): JSX.Element {
  const [sortKey, setSortKey] = useState<SortKey>('savedAt');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortAsc ? av - bv : bv - av;
      }
      return 0;
    });
    return copy;
  }, [items, sortKey, sortAsc]);

  function toggleSort(key: SortKey): void {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function sortMark(key: SortKey): string {
    if (sortKey !== key) return '';
    return sortAsc ? ' ↑' : ' ↓';
  }

  if (items.length === 0) {
    return (
      <Panel title="Saved session database">
        <p className="text-faint" style={{ fontSize: 12, margin: 0 }}>
          No saved sessions yet. Complete a session on Live, add venue notes, then Save.
        </p>
      </Panel>
    );
  }

  return (
    <Panel title="Saved session database">
      <div style={{ maxHeight: 360, overflow: 'auto' }}>
        <table className="data session-db-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>System</th>
              <th className="sortable" onClick={() => toggleSort('savedAt')}>
                Saved{sortMark('savedAt')}
              </th>
              <th className="num sortable" onClick={() => toggleSort('cardsSeen')}>
                Cards{sortMark('cardsSeen')}
              </th>
              <th className="num sortable" onClick={() => toggleSort('peakTrueCount')}>
                Peak TC{sortMark('peakTrueCount')}
              </th>
              <th className="num sortable" onClick={() => toggleSort('edgeProxy')}>
                Edge{sortMark('edgeProxy')}
              </th>
              <th className="num sortable" onClick={() => toggleSort('tcStrongPct')}>
                TC≥3{sortMark('tcStrongPct')}
              </th>
              <th className="num sortable" onClick={() => toggleSort('netPnL')}>
                P&amp;L{sortMark('netPnL')}
              </th>
              <th className="num sortable" onClick={() => toggleSort('winRate')}>
                Win%{sortMark('winRate')}
              </th>
              <th className="num sortable" onClick={() => toggleSort('maxPenetration')}>
                Pen%{sortMark('maxPenetration')}
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.name}
                className={selectedName === row.name ? 'selected' : ''}
                onClick={() => onSelect(row.name)}
              >
                <td>
                  <strong>{row.name}</strong>
                  {row.venue && <div className="text-faint" style={{ fontSize: 10 }}>{row.venue}</div>}
                </td>
                <td>
                  <span className={`badge sm ${row.sessionType}`}>{row.sessionType}</span>
                </td>
                <td className="text-dim">{row.systemName}</td>
                <td className="text-dim">{formatDate(row.savedAt)}</td>
                <td className="num">{row.cardsSeen}</td>
                <td className="num">{formatCount(row.peakTrueCount, precision)}</td>
                <td className="num">{row.edgeProxy.toFixed(3)}</td>
                <td className="num">{row.tcStrongPct.toFixed(0)}%</td>
                <td className={`num ${row.netPnL >= 0 ? 'text-pos' : 'text-neg'}`}>
                  {row.handsLogged > 0 ? formatMoney(row.netPnL) : '—'}
                </td>
                <td className="num">
                  {row.handsLogged > 0 ? `${(row.winRate * 100).toFixed(0)}%` : '—'}
                </td>
                <td className="num">{(row.maxPenetration * 100).toFixed(0)}%</td>
                <td className="num" onClick={(e) => e.stopPropagation()}>
                  <button className="btn ghost sm" onClick={() => onLoad(row.name)}>
                    Load
                  </button>{' '}
                  <button className="btn ghost sm danger" onClick={() => onDelete(row.name)}>
                    Del
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function SessionAggregateBar({ items }: { items: SessionListItem[] }): JSX.Element {
  if (items.length === 0) return <></>;

  const totalCards = items.reduce((s, i) => s + i.cardsSeen, 0);
  const totalDuration = items.reduce((s, i) => s + i.durationMs, 0);
  const totalPnL = items.reduce((s, i) => s + i.netPnL, 0);
  const bestPeak = Math.max(...items.map((i) => i.peakTrueCount));
  const avgEdge = items.reduce((s, i) => s + i.edgeProxy, 0) / items.length;
  const liveSessions = items.filter((i) => i.sessionType === 'live').length;

  return (
    <div className="aggregate-bar">
      <div className="agg-cell">
        <span className="label">Sessions</span>
        <span className="value">{items.length}</span>
      </div>
      <div className="agg-cell">
        <span className="label">Live</span>
        <span className="value">{liveSessions}</span>
      </div>
      <div className="agg-cell">
        <span className="label">Total cards</span>
        <span className="value">{totalCards.toLocaleString()}</span>
      </div>
      <div className="agg-cell">
        <span className="label">Total P&amp;L</span>
        <span className={`value ${totalPnL >= 0 ? 'text-pos' : 'text-neg'}`}>
          {formatMoney(totalPnL)}
        </span>
      </div>
      <div className="agg-cell">
        <span className="label">Best peak TC</span>
        <span className="value">{bestPeak.toFixed(1)}</span>
      </div>
      <div className="agg-cell">
        <span className="label">Avg edge proxy</span>
        <span className="value">{avgEdge.toFixed(3)}</span>
      </div>
      <div className="agg-cell">
        <span className="label">Total time</span>
        <span className="value">{Math.round(totalDuration / 60_000)}m</span>
      </div>
    </div>
  );
}
