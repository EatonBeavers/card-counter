import { RANK_LABEL } from '../../types/card';
import { parseSpokenTranscript } from '../../engine/parseSpokenRanks';
import { useSpeechInput } from '../../hooks/useSpeechInput';

function formatLastActions(transcript: string): string {
  const actions = parseSpokenTranscript(transcript).filter((a) => a.type === 'card');
  if (actions.length === 0) return '';
  return actions
    .map((a) => (a.burn ? `burn ${RANK_LABEL[a.rank]}` : RANK_LABEL[a.rank]))
    .join(' · ');
}

export function VoiceEntry(): JSX.Element {
  const { status, listening, supported, lastTranscript, errorMessage, toggleListening } = useSpeechInput();
  const cardsAdded = lastTranscript ? formatLastActions(lastTranscript) : '';

  return (
    <div className="voice-entry">
      <div className="voice-entry-row">
        <button
          type="button"
          className={`btn voice-mic${listening ? ' active' : ''}`}
          onClick={toggleListening}
          disabled={!supported || status === 'loading'}
          title={supported ? 'Toggle voice card entry' : 'Voice input is not supported in this environment'}
        >
          <span className="voice-mic-icon" aria-hidden="true">
            {listening ? '◉' : '◎'}
          </span>
          {status === 'loading' ? 'Loading…' : listening ? 'Listening…' : 'Voice Entry'}
        </button>
        <span className={`voice-status ${status}`}>
          {!supported && 'Not supported'}
          {supported && status === 'loading' && 'Loading offline speech model (first time ~30s) — click again to cancel'}
          {supported && listening && 'Say card names as they are dealt'}
          {supported && status === 'idle' && !listening && 'Mic off · works offline'}
          {supported && status === 'error' && (errorMessage ?? 'Microphone error')}
        </span>
      </div>

      {lastTranscript && (
        <p className="voice-transcript">
          Heard: <span className="heard">{lastTranscript}</span>
          {cardsAdded && (
            <>
              {' '}
              → <span className="parsed">{cardsAdded}</span>
            </>
          )}
        </p>
      )}

      <p className="text-faint voice-hint">
        Offline voice — say: &quot;ace, ten, four, queen&quot; · &quot;burn ace&quot; · &quot;undo&quot; ·
        &quot;next round&quot;
      </p>
    </div>
  );
}
