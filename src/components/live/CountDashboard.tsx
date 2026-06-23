import { Panel } from '../ui/Panel';
import { Sparkline } from '../ui/Sparkline';
import { useLiveStats } from '../../hooks/useLiveStats';
import { useStore } from '../../state/store';
import { formatCount } from '../../engine';
import type { AdvantageZone } from '../../types';

const ZONE_ORDER: AdvantageZone[] = ['negative', 'neutral', 'positive', 'strong'];

function signClass(n: number): string {
  return n > 0 ? 'pos' : n < 0 ? 'neg' : 'neutral';
}

export function CountDashboard(): JSX.Element {
  const precision = useStore((s) => s.settings.displayPrecision);
  const session = useStore((s) => s.session);
  const { stats, recommendation } = useLiveStats();

  const trueSeries = session.history.map((h) => h.trueCount);
  const runSeries = session.history.map((h) => h.runningCount);

  return (
    <div className="stack">
      <Panel title="True Count">
        <div className="stat-hero">
          <span className={`value xl ${signClass(stats.trueCount)}`}>
            {formatCount(stats.trueCount, precision)}
          </span>
        </div>
        <div className="zone-bar">
          {ZONE_ORDER.map((z) => (
            <div
              key={z}
              className={`seg ${z}${recommendation.zone === z ? ' on' : ''}`}
              title={z}
            />
          ))}
        </div>
      </Panel>

      <div className="stat-grid">
        <div className="stat-cell">
          <div className="label">Running Count</div>
          <div className={`value ${signClass(stats.runningCount)}`}>
            {formatCount(stats.runningCount, precision)}
          </div>
        </div>
        <div className="stat-cell">
          <div className="label">Decks Remaining</div>
          <div className="value">{stats.decksRemaining}</div>
        </div>
        <div className="stat-cell">
          <div className="label">Cards Seen</div>
          <div className="value">{stats.cardsSeen}</div>
        </div>
        <div className="stat-cell">
          <div className="label">Penetration</div>
          <div className="value">{Math.round(stats.penetration * 100)}%</div>
        </div>
      </div>

      <Panel title="True Count History">
        <Sparkline values={trueSeries} secondary={runSeries} />
        <p className="text-faint" style={{ fontSize: 11, margin: '6px 0 0' }}>
          Bold = true count · faint = running count
        </p>
      </Panel>
    </div>
  );
}
