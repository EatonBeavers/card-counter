import { SUITS, SUIT_SYMBOL, RANKS } from '../../types/card';
import type { Rank, Suit } from '../../types';
import { useStore } from '../../state/store';
import { useLiveStats } from '../../hooks/useLiveStats';
import { emptyRankCounts } from '../../state/derive';

// Visual order across each suit row. 10/J/Q/K all map to the counting rank "T".
const COLS: Array<{ rank: Rank; label: string }> = [
  { rank: 'A', label: 'A' },
  { rank: '2', label: '2' },
  { rank: '3', label: '3' },
  { rank: '4', label: '4' },
  { rank: '5', label: '5' },
  { rank: '6', label: '6' },
  { rank: '7', label: '7' },
  { rank: '8', label: '8' },
  { rank: '9', label: '9' },
  { rank: 'T', label: '10' },
  { rank: 'T', label: 'J' },
  { rank: 'T', label: 'Q' },
  { rank: 'T', label: 'K' },
];

/**
 * Full single-deck visual grid. Each face is clickable and logs a card of that
 * rank+suit. Faces are shaded "dealt" by drawing down a per-rank remaining
 * counter in render order — a single-deck visual aid for what's been seen.
 */
export function DeckGrid(): JSX.Element {
  const addCard = useStore((s) => s.addCard);
  const { stats } = useLiveStats();

  // Remaining-to-shade per rank for this render pass.
  const remaining = emptyRankCounts();
  for (const r of RANKS) remaining[r] = stats.rankCounts[r];

  function consumeDealt(rank: Rank): boolean {
    if (remaining[rank] > 0) {
      remaining[rank] -= 1;
      return true;
    }
    return false;
  }

  return (
    <div className="stack">
      {SUITS.map((suit) => {
        const red = suit === 'hearts' || suit === 'diamonds';
        return (
          <div
            key={suit}
            className="deck-grid"
            style={{ gridTemplateColumns: '18px repeat(13, 1fr)' }}
          >
            <div className="suit-label" style={{ color: red ? 'var(--neg)' : 'var(--text-faint)' }}>
              {SUIT_SYMBOL[suit]}
            </div>
            {COLS.map((c, i) => {
              const dealt = consumeDealt(c.rank);
              return (
                <button
                  key={`${suit}-${i}`}
                  className={`pcard${red ? ' red' : ''}${dealt ? ' dealt' : ''}`}
                  onClick={() => addCard(c.rank, suit as Suit)}
                  title={`${c.label}${SUIT_SYMBOL[suit]}`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        );
      })}
      <p className="text-faint" style={{ fontSize: 11, margin: 0 }}>
        Tip: 10/J/Q/K all count as the ten-rank "T". Dealt shading is a single-deck visual aid.
      </p>
    </div>
  );
}
