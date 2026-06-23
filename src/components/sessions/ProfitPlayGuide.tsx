import { COUNT_SYSTEMS } from '../../data/countSystems';
import { Panel } from '../ui/Panel';

const TOP_SYSTEMS = [...COUNT_SYSTEMS]
  .filter((s) => !s.isPlaceholder)
  .sort((a, b) => b.metrics.bc + b.metrics.pe - (a.metrics.bc + a.metrics.pe))
  .slice(0, 5);

export function ProfitPlayGuide(): JSX.Element {
  return (
    <Panel title="Profitable play reference">
      <p className="text-faint" style={{ fontSize: 12, margin: '0 0 12px' }}>
        Sessions are most valuable when penetration is deep, the count is positive, and your
        spread matches the true count. Use saved analytics to find tables and conditions that
        produced the highest edge proxy.
      </p>

      <div className="guide-list">
        <div className="guide-item">
          <strong>Wong in / out</strong>
          <span>Enter at TC ≥ +1 with a ramp; leave or flat-bet minimum when TC &lt; 0.</span>
        </div>
        <div className="guide-item">
          <strong>Penetration</strong>
          <span>
            75%+ penetration maximizes hands at positive counts. Track max penetration per session.
          </span>
        </div>
        <div className="guide-item">
          <strong>Spread discipline</strong>
          <span>
            Compare avg recommended bet vs what you actually wagered — large gaps erode EV.
          </span>
        </div>
        <div className="guide-item">
          <strong>Insurance</strong>
          <span>Take insurance only above your system&apos;s threshold (Live view prompt).</span>
        </div>
      </div>

      <div className="panel-title" style={{ marginTop: 14, marginBottom: 8 }}>
        Top systems by BC + PE
      </div>
      <table className="data compact">
        <thead>
          <tr>
            <th>System</th>
            <th className="num">BC</th>
            <th className="num">PE</th>
            <th className="num">IC</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody>
          {TOP_SYSTEMS.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td className="num">{s.metrics.bc.toFixed(2)}</td>
              <td className="num">{s.metrics.pe.toFixed(2)}</td>
              <td className="num">{s.metrics.ic.toFixed(2)}</td>
              <td className="text-dim">L{s.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}
