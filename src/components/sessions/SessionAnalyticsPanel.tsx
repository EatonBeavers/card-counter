import { formatCount } from '../../engine';
import { getSystemOrDefault } from '../../data/countSystems';
import type { DisplayPrecision } from '../../types';
import type { SessionMeta, SessionSummary } from '../../types/session';
import { Panel } from '../ui/Panel';

interface Props {
  summary: SessionSummary;
  meta?: SessionMeta;
  precision: DisplayPrecision;
  title?: string;
}

function pct(n: number): string {
  return `${n.toFixed(1)}%`;
}

function duration(ms: number): string {
  if (ms < 60_000) return `${Math.round(ms / 1000)}s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m}m ${s}s`;
}

export function SessionAnalyticsPanel({ summary, meta, precision, title }: Props): JSX.Element {
  const zones = summary.zoneDistribution;
  const zoneTotal = zones.negative + zones.neutral + zones.positive + zones.strong || 1;
  const system = meta ? getSystemOrDefault(meta.systemId) : null;

  return (
    <Panel title={title ?? 'Session Analytics'}>
      <div className="stat-grid">
        <div className="stat-cell">
          <div className="label">Peak TC</div>
          <div className="value">{formatCount(summary.peakTrueCount, precision)}</div>
        </div>
        <div className="stat-cell">
          <div className="label">Low TC</div>
          <div className="value">{formatCount(summary.lowTrueCount, precision)}</div>
        </div>
        <div className="stat-cell">
          <div className="label">Avg TC</div>
          <div className="value">{formatCount(summary.avgTrueCount, precision)}</div>
        </div>
        <div className="stat-cell">
          <div className="label">Edge proxy</div>
          <div className="value" title="BC × avg positive TC × positive rate">
            {summary.edgeProxy.toFixed(3)}
          </div>
        </div>
        <div className="stat-cell">
          <div className="label">Cards seen</div>
          <div className="value">{summary.cardsSeen}</div>
        </div>
        <div className="stat-cell">
          <div className="label">Rounds</div>
          <div className="value">{summary.roundsPlayed}</div>
        </div>
        <div className="stat-cell">
          <div className="label">Shoes</div>
          <div className="value">{summary.shoesPlayed}</div>
        </div>
        <div className="stat-cell">
          <div className="label">Penetration</div>
          <div className="value">{pct(summary.maxPenetration * 100)}</div>
        </div>
        <div className="stat-cell">
          <div className="label">TC &gt; 0</div>
          <div className="value">{pct(summary.tcPositivePct)}</div>
        </div>
        <div className="stat-cell">
          <div className="label">TC ≥ 3</div>
          <div className="value">{pct(summary.tcStrongPct)}</div>
        </div>
        <div className="stat-cell">
          <div className="label">Avg rec. bet</div>
          <div className="value">${summary.avgRecommendedBet.toFixed(0)}</div>
        </div>
        <div className="stat-cell">
          <div className="label">Duration</div>
          <div className="value">{duration(summary.durationMs)}</div>
        </div>
      </div>

      <div className="zone-bars" style={{ marginTop: 14 }}>
        <div className="panel-title" style={{ marginBottom: 8 }}>
          Advantage zones (by card)
        </div>
        {(
          [
            ['negative', 'Negative', 'var(--neg)'],
            ['neutral', 'Neutral', 'var(--text-dim)'],
            ['positive', 'Positive', 'var(--accent)'],
            ['strong', 'Strong', 'var(--pos)'],
          ] as const
        ).map(([key, label, color]) => (
          <div className="zone-bar-row" key={key}>
            <span className="zone-bar-label">{label}</span>
            <div className="zone-bar-track">
              <div
                className="zone-bar-fill"
                style={{
                  width: `${(zones[key] / zoneTotal) * 100}%`,
                  background: color,
                }}
              />
            </div>
            <span className="zone-bar-pct">{pct((zones[key] / zoneTotal) * 100)}</span>
          </div>
        ))}
      </div>

      <div className="tc-histogram" style={{ marginTop: 14 }}>
        <div className="panel-title" style={{ marginBottom: 8 }}>
          True count distribution
        </div>
        <div className="tc-histogram-bars">
          {summary.tcHistogram.map(({ tc, count }) => {
            const max = Math.max(...summary.tcHistogram.map((b) => b.count), 1);
            return (
              <div className="tc-hist-col" key={tc} title={`TC ${tc}: ${count} cards`}>
                <div
                  className="tc-hist-bar"
                  style={{ height: `${(count / max) * 100}%`, opacity: count ? 1 : 0.15 }}
                />
                <span className="tc-hist-label">{tc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {meta && (
        <div className="session-meta-block" style={{ marginTop: 14 }}>
          <div className="panel-title" style={{ marginBottom: 8 }}>
            Table context (saved snapshot)
          </div>
          <div className="meta-grid">
            <span>System</span>
            <strong>{meta.systemName}</strong>
            <span>Ramp</span>
            <strong>{meta.betRamp.name}</strong>
            <span>Decks</span>
            <strong>{meta.rules.decks}</strong>
            <span>Penetration</span>
            <strong>{pct(meta.rules.penetration * 100)}</strong>
            <span>BJ payout</span>
            <strong>{meta.rules.blackjackPayout}</strong>
            <span>Spread</span>
            <strong>
              ${meta.rules.tableMin}–${meta.rules.tableMax}
            </strong>
            <span>BC / PE / IC</span>
            <strong>
              {system
                ? `${system.metrics.bc.toFixed(2)} / ${system.metrics.pe.toFixed(2)} / ${system.metrics.ic.toFixed(2)}`
                : '—'}
            </strong>
          </div>
        </div>
      )}
    </Panel>
  );
}
