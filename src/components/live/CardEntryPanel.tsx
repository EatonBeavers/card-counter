import { useState } from 'react';
import { Panel } from '../ui/Panel';
import { RankPad } from './RankPad';
import { DeckGrid } from './DeckGrid';
import { VoiceEntry } from './VoiceEntry';
import { useStore } from '../../state/store';

type Mode = 'pad' | 'deck';

export function CardEntryPanel(): JSX.Element {
  const [mode, setMode] = useState<Mode>('pad');
  const undoCard = useStore((s) => s.undoCard);
  const undoRound = useStore((s) => s.undoRound);
  const resetShoe = useStore((s) => s.resetShoe);
  const nextRound = useStore((s) => s.nextRound);

  return (
    <Panel
      title="Card Entry"
      actions={
        <div className="segmented">
          <button className={mode === 'pad' ? 'active' : ''} onClick={() => setMode('pad')}>
            Rank Pad
          </button>
          <button className={mode === 'deck' ? 'active' : ''} onClick={() => setMode('deck')}>
            Full Deck
          </button>
        </div>
      }
    >
      {mode === 'pad' ? <RankPad /> : <DeckGrid />}

      <VoiceEntry />

      <div className="btn-row" style={{ marginTop: 14 }}>
        <button className="btn" onClick={undoCard} title="Undo last card (Backspace)">
          ↶ Undo Card
        </button>
        <button className="btn" onClick={undoRound} title="Undo last round">
          ⨯ Undo Round
        </button>
        <button className="btn primary" onClick={nextRound} title="Next round (Enter)">
          → Next Round
        </button>
        <button className="btn danger" onClick={resetShoe} title="Reset shoe (R)">
          ⟲ Reset Shoe
        </button>
      </div>
      <p className="text-faint" style={{ fontSize: 11, marginTop: 8, marginBottom: 0 }}>
        Keyboard: rank keys A 2–9 0/T add a card · Shift+rank = burn card · mic for voice · ? for shortcuts
      </p>
    </Panel>
  );
}
