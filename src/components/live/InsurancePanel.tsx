import { Panel } from '../ui/Panel';
import { useLiveStats } from '../../hooks/useLiveStats';
import { useStore } from '../../state/store';
import { insuranceThreshold, shouldTakeInsurance } from '../../engine';
import { formatCount } from '../../engine';

export function InsurancePanel(): JSX.Element | null {
  const enabled = useStore((s) => s.insurancePromptEnabled);
  const insuranceAvailable = useStore((s) => s.rules.insuranceAvailable);
  const precision = useStore((s) => s.settings.displayPrecision);
  const toggle = useStore((s) => s.toggleInsurancePrompt);
  const { system, stats } = useLiveStats();

  if (!enabled) return null;

  const take = insuranceAvailable && shouldTakeInsurance(system, stats.trueCount);
  const threshold = insuranceThreshold(system);

  return (
    <Panel
      title="Insurance"
      actions={
        <button className="btn ghost sm" onClick={toggle} title="Toggle (I)">
          Hide
        </button>
      }
    >
      {!insuranceAvailable ? (
        <div className="alert hold">Insurance not offered at this table.</div>
      ) : take ? (
        <div className="alert go">TAKE INSURANCE — true count ≥ {formatCount(threshold, precision)}</div>
      ) : (
        <div className="alert hold">
          Decline — take only at TC ≥ {formatCount(threshold, precision)}
        </div>
      )}
    </Panel>
  );
}
