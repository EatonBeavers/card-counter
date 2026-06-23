import { RANKS, RANK_LABEL } from '../../types/card';
import { useStore } from '../../state/store';
import { useLiveStats } from '../../hooks/useLiveStats';
import { formatCount } from '../../engine';

/** Fast rank-only entry. Shows each rank's count weight and how many were seen. */
export function RankPad(): JSX.Element {
  const addCard = useStore((s) => s.addCard);
  const precision = useStore((s) => s.settings.displayPrecision);
  const { system, stats } = useLiveStats();

  return (
    <div className="rank-pad">
      {RANKS.map((rank) => {
        const w = system.weights[rank];
        const cls = w > 0 ? 'pos' : w < 0 ? 'neg' : 'neutral';
        return (
          <button key={rank} className="rank-key" onClick={() => addCard(rank)} title={`Add ${RANK_LABEL[rank]}`}>
            {stats.rankCounts[rank] > 0 && <span className="seen">{stats.rankCounts[rank]}</span>}
            <span>{RANK_LABEL[rank]}</span>
            <span className={`w ${cls}`}>{formatCount(w, precision === 'exact' ? 'exact' : 'oneDecimal')}</span>
          </button>
        );
      })}
    </div>
  );
}
