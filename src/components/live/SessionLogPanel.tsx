import { Panel } from '../ui/Panel';
import { useStore } from '../../state/store';
import { RANK_LABEL } from '../../types/card';

/** Compact, scannable chip log of every card entered, newest last. */
export function SessionLogPanel(): JSX.Element {
  const events = useStore((s) => s.session.events);
  const round = useStore((s) => s.session.round);

  return (
    <Panel
      title="Session Log"
      actions={
        <span className="text-faint" style={{ fontSize: 11 }}>
          {events.length} cards · round {round + 1}
        </span>
      }
    >
      {events.length === 0 ? (
        <p className="text-faint" style={{ fontSize: 12, margin: 0 }}>
          No cards entered yet. Press a rank key or click the pad to begin.
        </p>
      ) : (
        <div className="log">
          {events.map((e, i) => {
            const isRoundStart = i === 0 || events[i - 1]!.round !== e.round;
            return (
              <span
                key={e.id}
                className={`log-chip${e.burn ? ' burn' : ''}${isRoundStart ? ' round-start' : ''}`}
                title={`${e.burn ? 'Burn · ' : ''}Round ${e.round + 1} · ${new Date(e.at).toLocaleTimeString()}`}
              >
                {RANK_LABEL[e.card.rank]}
              </span>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
