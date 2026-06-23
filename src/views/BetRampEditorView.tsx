import { Panel } from '../components/ui/Panel';
import { useStore } from '../state/store';
import { makeId } from '../state/sessionFactory';
import { recommendBet } from '../engine';
import { formatMoney } from '../engine';
import type { BetRamp } from '../types';

const SAMPLE_TCS = [-2, -1, 0, 1, 2, 3, 4, 5, 6];

export function BetRampEditorView(): JSX.Element {
  const ramps = useStore((s) => s.ramps);
  const activeRampId = useStore((s) => s.activeRampId);
  const setActiveRamp = useStore((s) => s.setActiveRamp);
  const upsertRamp = useStore((s) => s.upsertRamp);
  const deleteRamp = useStore((s) => s.deleteRamp);
  const rules = useStore((s) => s.rules);
  const settings = useStore((s) => s.settings);

  const ramp = ramps.find((r) => r.id === activeRampId) ?? ramps[0]!;

  function update(next: BetRamp): void {
    upsertRamp(next);
  }

  function setTier(index: number, field: 'trueCountFrom' | 'units', value: number): void {
    const tiers = ramp.tiers.map((t, i) => (i === index ? { ...t, [field]: value } : t));
    update({ ...ramp, tiers, profile: 'custom' });
  }

  function addTier(): void {
    const last = ramp.tiers[ramp.tiers.length - 1];
    const tiers = [
      ...ramp.tiers,
      { trueCountFrom: (last?.trueCountFrom ?? 0) + 1, units: (last?.units ?? 1) + 1 },
    ];
    update({ ...ramp, tiers, profile: 'custom' });
  }

  function removeTier(index: number): void {
    if (ramp.tiers.length <= 1) return;
    update({ ...ramp, tiers: ramp.tiers.filter((_, i) => i !== index), profile: 'custom' });
  }

  function createRamp(): void {
    const id = makeId('ramp');
    const next: BetRamp = {
      id,
      name: `Custom Ramp ${ramps.length + 1}`,
      profile: 'custom',
      tiers: [
        { trueCountFrom: -99, units: 1 },
        { trueCountFrom: 2, units: 2 },
        { trueCountFrom: 4, units: 4 },
      ],
    };
    upsertRamp(next);
    setActiveRamp(id);
  }

  return (
    <div>
      <div className="view-header">
        <div>
          <h2>Bet Ramp Editor</h2>
          <div className="sub">Data-driven wager tiers by true count · unit = {formatMoney(rules.unitSize)}</div>
        </div>
        <div className="btn-row">
          <select value={activeRampId} onChange={(e) => setActiveRamp(e.target.value)}>
            {ramps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button className="btn" onClick={createRamp}>
            + New Ramp
          </button>
          <button className="btn danger" onClick={() => deleteRamp(ramp.id)}>
            Delete
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="Tiers">
          <div className="field">
            <label>Ramp name</label>
            <input
              type="text"
              value={ramp.name}
              onChange={(e) => update({ ...ramp, name: e.target.value })}
            />
          </div>

          <table className="data">
            <thead>
              <tr>
                <th className="num">TC from</th>
                <th className="num">Units</th>
                <th className="num">Wager</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ramp.tiers.map((t, i) => (
                <tr key={i}>
                  <td className="num">
                    <input
                      type="number"
                      style={{ width: 70 }}
                      value={t.trueCountFrom}
                      step={0.5}
                      onChange={(e) => setTier(i, 'trueCountFrom', Number(e.target.value))}
                    />
                  </td>
                  <td className="num">
                    <input
                      type="number"
                      style={{ width: 70 }}
                      value={t.units}
                      step={0.5}
                      min={0}
                      onChange={(e) => setTier(i, 'units', Number(e.target.value))}
                    />
                  </td>
                  <td className="num">{formatMoney(t.units * rules.unitSize)}</td>
                  <td className="num">
                    <button className="btn ghost sm danger" onClick={() => removeTier(i)}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn sm" style={{ marginTop: 10 }} onClick={addTier}>
            + Add Tier
          </button>
        </Panel>

        <Panel title="Simulated Wagers">
          <p className="text-faint" style={{ fontSize: 11, marginTop: 0 }}>
            Using table min {formatMoney(rules.tableMin)} / max {formatMoney(rules.tableMax)} and{' '}
            {Math.round(settings.bankrollRiskFraction * 100)}% bankroll cap on{' '}
            {formatMoney(rules.startingBankroll)}.
          </p>
          <table className="data">
            <thead>
              <tr>
                <th className="num">True Count</th>
                <th className="num">Units</th>
                <th className="num">Wager</th>
                <th>Zone</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_TCS.map((tc) => {
                const rec = recommendBet(
                  tc,
                  ramp,
                  rules,
                  rules.startingBankroll,
                  settings.bankrollRiskFraction,
                );
                return (
                  <tr key={tc}>
                    <td className="num">{tc > 0 ? `+${tc}` : tc}</td>
                    <td className="num">{rec.units}</td>
                    <td className="num">
                      {formatMoney(rec.amount)}
                      {rec.clamped ? ' *' : ''}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          rec.zone === 'strong'
                            ? 'warn'
                            : rec.zone === 'positive'
                              ? 'accent'
                              : ''
                        }`}
                      >
                        {rec.zone}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="text-faint" style={{ fontSize: 11, marginBottom: 0 }}>
            * capped by table max or bankroll risk limit
          </p>
        </Panel>
      </div>
    </div>
  );
}
