import { Panel } from '../ui/Panel';
import { useLiveStats } from '../../hooks/useLiveStats';
import { useStore } from '../../state/store';
import { formatMoney } from '../../engine';
import type { AdvantageZone } from '../../types';

const ZONE_CLASS: Record<AdvantageZone, string> = {
  negative: 'neg',
  neutral: 'neutral',
  positive: 'pos',
  strong: 'strong',
};

const ZONE_LABEL: Record<AdvantageZone, string> = {
  negative: 'NEGATIVE',
  neutral: 'NEUTRAL',
  positive: 'ADVANTAGE',
  strong: 'STRONG EDGE',
};

export function BettingPanel(): JSX.Element {
  const ramps = useStore((s) => s.ramps);
  const activeRampId = useStore((s) => s.activeRampId);
  const setActiveRamp = useStore((s) => s.setActiveRamp);
  const setView = useStore((s) => s.setView);
  const { recommendation } = useLiveStats();

  return (
    <Panel
      title="Betting Guidance"
      actions={
        <button className="btn ghost sm" onClick={() => setView('ramps')}>
          Edit Ramp
        </button>
      }
    >
      <div className="field" style={{ marginBottom: 12 }}>
        <select value={activeRampId} onChange={(e) => setActiveRamp(e.target.value)}>
          {ramps.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <span className={`badge ${ZONE_CLASS[recommendation.zone]}`} style={{ marginBottom: 8 }}>
        ● {ZONE_LABEL[recommendation.zone]}
      </span>

      <div className={`bet-amount ${ZONE_CLASS[recommendation.zone]}`}>
        {formatMoney(recommendation.amount)}
      </div>
      <div className="bet-note">
        {recommendation.units} unit{recommendation.units === 1 ? '' : 's'}
        {recommendation.clamped ? ' · capped' : ''}
      </div>
      <p className="bet-note">{recommendation.note}</p>
    </Panel>
  );
}
