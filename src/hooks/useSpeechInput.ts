import { useCallback, useEffect, useRef, useState } from 'react';
import { parseSpokenTranscript } from '../engine/parseSpokenRanks';
import { useStore } from '../state/store';
import { startVoskListening, type VoskListenSession } from './voskSpeech';

export type SpeechInputStatus = 'idle' | 'loading' | 'listening' | 'unsupported' | 'error';

/** User-facing text for mic / recognition failures. */
export function formatSpeechError(error: string): string {
  switch (error) {
    case 'not-allowed':
      return 'Microphone blocked — allow mic access for Card Counter in Windows Settings → Privacy → Microphone.';
    case 'audio-capture':
      return 'No microphone found — plug one in or check Windows sound settings.';
  }
  if (error.includes('model') || error.includes('Model')) {
    return 'Could not load the offline speech model — try reinstalling from the zip.';
  }
  if (/fetch failed/i.test(error)) {
    return 'Could not download the speech model — try restarting the app or reinstalling from the zip.';
  }
  return error;
}

/** Offline Vosk speech-to-text card entry (works in the packaged Electron app). */
export function useSpeechInput() {
  const addCard = useStore((s) => s.addCard);
  const addBurnCard = useStore((s) => s.addBurnCard);
  const undoCard = useStore((s) => s.undoCard);
  const nextRound = useStore((s) => s.nextRound);
  const resetShoe = useStore((s) => s.resetShoe);

  const sessionRef = useRef<VoskListenSession | null>(null);
  const loadGenRef = useRef(0);
  const [status, setStatus] = useState<SpeechInputStatus>('idle');
  const [lastTranscript, setLastTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia;

  const applyTranscript = useCallback(
    (transcript: string) => {
      const trimmed = transcript.trim();
      if (!trimmed) return;

      setLastTranscript(trimmed);
      for (const action of parseSpokenTranscript(trimmed)) {
        switch (action.type) {
          case 'card':
            if (action.burn) addBurnCard(action.rank);
            else addCard(action.rank);
            break;
          case 'undo':
            undoCard();
            break;
          case 'nextRound':
            nextRound();
            break;
          case 'reset':
            resetShoe();
            break;
        }
      }
    },
    [addBurnCard, addCard, nextRound, resetShoe, undoCard],
  );

  const stopListening = useCallback(() => {
    loadGenRef.current += 1;
    sessionRef.current?.stop();
    sessionRef.current = null;
    setStatus('idle');
  }, []);

  const startListening = useCallback(async () => {
    if (!supported) {
      setStatus('unsupported');
      return;
    }

    const gen = ++loadGenRef.current;
    setErrorMessage(null);
    setStatus('loading');

    try {
      const session = await startVoskListening(applyTranscript);
      if (gen !== loadGenRef.current) {
        session.stop();
        return;
      }
      sessionRef.current = session;
      setStatus('listening');
    } catch (err) {
      if (gen !== loadGenRef.current) return;
      sessionRef.current = null;
      setStatus('error');
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError') {
        setErrorMessage(formatSpeechError('not-allowed'));
      } else if (name === 'NotFoundError') {
        setErrorMessage(formatSpeechError('audio-capture'));
      } else {
        setErrorMessage(formatSpeechError(err instanceof Error ? err.message : 'Could not start voice input'));
      }
    }
  }, [applyTranscript, supported]);

  const toggleListening = useCallback(() => {
    if (status === 'listening' || status === 'loading') stopListening();
    else void startListening();
  }, [startListening, status, stopListening]);

  useEffect(() => () => {
    sessionRef.current?.stop();
    sessionRef.current = null;
  }, []);

  return {
    status,
    listening: status === 'listening',
    supported,
    lastTranscript,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
  };
}
