import { useMemo, useState } from 'react';
import { Panel } from '../ui/Panel';
import { useLiveStats } from '../../hooks/useLiveStats';
import { useStore } from '../../state/store';
import { formatCount, formatMoney, OUTCOME_LABEL } from '../../engine';
import { computePnlStats, sessionBankroll } from '../../engine/sessionPnl';
import type { RoundOutcome } from '../../types';

const OUTCOMES: RoundOutcome[] = ['win', 'loss', 'push', 'blackjack', 'surrender'];

const OUTCOME_BTN_CLASS: Record<RoundOutcome, string> = {
  win: 'pos',
  loss: 'neg',
  push: 'neutral',
  blackjack: 'strong',
  surrender: 'warn',
};

export function RoundOutcomePanel(): JSX.Element {
  const session = useStore((s) => s.session);
  const rules = useStore((s) => s.rules);
  const precision = useStore((s) => s.settings.displayPrecision);
  const logRoundOutcome = useStore((s) => s.logRoundOutcome);
  const { stats, recommendation } = useLiveStats();

  const [betInput, setBetInput] = useState('');

  const pnl = useMemo(
    () => computePnlStats(session.roundOutcomes, rules.startingBankroll),
    [session.roundOutcomes, rules.startingBankroll],
  );

  const bankroll = sessionBankroll(session, rules.startingBankroll);
  const currentRoundOutcome = session.roundOutcomes.find((o) => o.round === session.round);
  const suggestedBet = betInput ? Number(betInput) : recommendation.amount;

  function log(outcome: RoundOutcome): void {
    const bet = betInput ? Number(betInput) : undefined;
    logRoundOutcome(outcome, bet && !Number.isNaN(bet) ? bet : undefined);
    setBetInput('');
  }

  return (
    <Panel title="Hand Result">
      <div className="stat-grid" style={{ marginBottom: 12 }}>
        <div className="stat-cell">
          <div className="label">Bankroll</div>
          <div className="value">{formatMoney(bankroll)}</div>
        </div>
        <div className="stat-cell">
          <div className="label">Session P&amp;L</div>
          <div className={`value ${pnl.netPnL >= 0 ? 'text-pos' : 'text-neg'}`}>
            {pnl.netPnL >= 0 ? '+' : ''}
            {formatMoney(pnl.netPnL)}
          </div>
        </div>
        <div className="stat-cell">
          <div className="label">Hands logged</div>
          <div className="value">{pnl.handsLogged}</div>
        </div>
        <div className="stat-cell">
          <div className="label">Win rate</div>
          <div className="value">{(pnl.winRate * 100).toFixed(0)}%</div>
        </div>
      </div>

      <div className="field" style={{ marginBottom: 10 }}>
        <label className="text-dim" style={{ fontSize: 11 }}>
          Wager this hand (defaults to {formatMoney(recommendation.amount)})
        </label>
        <input
          type="number"
          min={rules.tableMin}
          max={rules.tableMax}
          step={rules.unitSize}
          placeholder={String(recommendation.amount)}
          value={betInput}
          onChange={(e) => setBetInput(e.target.value)}
        />
      </div>

      <p className="text-faint" style={{ fontSize: 11, margin: '0 0 10px' }}>
        Round {session.round + 1} · TC {formatCount(stats.trueCount, precision)} · logs outcome and
        advances to next round
      </p>

      {currentRoundOutcome && (
        <p className="text-faint" style={{ fontSize: 11, margin: '0 0 10px' }}>
          This round already logged — clicking again replaces it.
        </p>
      )}

      <div className="outcome-btns">
        {OUTCOMES.map((o) => (
          <button
            key={o}
            type="button"
            className={`btn outcome-btn ${OUTCOME_BTN_CLASS[o]}`}
            onClick={() => log(o)}
            title={`${OUTCOME_LABEL[o]} at ${formatMoney(suggestedBet)}`}
          >
            {OUTCOME_LABEL[o]}
          </button>
        ))}
      </div>

      {session.roundOutcomes.length > 0 && (
        <div className="recent-outcomes">
          <div className="panel-title" style={{ marginTop: 14, marginBottom: 6 }}>
            Recent hands
          </div>
          <table className="data compact">
            <thead>
              <tr>
                <th>#</th>
                <th>Result</th>
                <th className="num">Bet</th>
                <th className="num">P&amp;L</th>
                <th className="num">TC</th>
              </tr>
            </thead>
            <tbody>
              {[...session.roundOutcomes]
                .sort((a, b) => b.at - a.at)
                .slice(0, 8)
                .map((r) => (
                  <tr key={r.id}>
                    <td>{r.round + 1}</td>
                    <td>{OUTCOME_LABEL[r.outcome]}</td>
                    <td className="num">{formatMoney(r.bet)}</td>
                    <td className={`num ${r.netResult >= 0 ? 'text-pos' : 'text-neg'}`}>
                      {r.netResult >= 0 ? '+' : ''}
                      {formatMoney(r.netResult)}
                    </td>
                    <td className="num">{formatCount(r.trueCount, precision)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
