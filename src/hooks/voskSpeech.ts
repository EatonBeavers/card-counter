import { Model } from 'vosk-browser';
import { isDesktop } from '../types';

const WEB_MODEL_URL = `${import.meta.env.BASE_URL}models/vosk-model-small-en-us.tar.gz`;

/** Restrict recognition to card names and a few commands for better accuracy. */
export const CARD_GRAMMAR = JSON.stringify([
  'ace',
  'two',
  'deuce',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'jack',
  'queen',
  'king',
  'burn',
  'undo',
  'back',
  'reset',
  'next',
  'round',
  '[unk]',
]);

let modelPromise: Promise<Model> | null = null;

const MODEL_LOAD_TIMEOUT_MS = 90_000;

/**
 * Vosk downloads the model inside a blob Web Worker via fetch().
 * Packaged Electron serves UI + model from the same http://127.0.0.1 origin.
 * Dev uses Vite's /models/ path on the same origin as the page.
 */
async function resolveSpeechModelUrl(): Promise<string> {
  if (!isDesktop()) return WEB_MODEL_URL;
  if (import.meta.env.DEV) return WEB_MODEL_URL;
  return window.api!.getSpeechModelUrl();
}

function loadVoskModel(modelUrl: string): Promise<Model> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    const timer = setTimeout(
      () => finish(() => reject(new Error('Speech model load timed out — try restarting the app'))),
      MODEL_LOAD_TIMEOUT_MS,
    );

    try {
      const model = new Model(modelUrl);
      model.on('load', (message) => {
        if (message.event !== 'load') return;
        if (message.result) finish(() => resolve(model));
        else finish(() => reject(new Error('Speech model failed to load')));
      });
      model.on('error', (message) => {
        const detail = 'error' in message ? message.error : 'Speech model error';
        finish(() => reject(new Error(detail)));
      });
    } catch (err) {
      finish(() =>
        reject(err instanceof Error ? err : new Error('Could not start speech engine')),
      );
    }
  });
}

export function preloadVoskModel(): Promise<Model> {
  if (!modelPromise) {
    modelPromise = resolveSpeechModelUrl()
      .then((url) => loadVoskModel(url))
      .catch((err) => {
        modelPromise = null;
        throw err;
      });
  }
  return modelPromise;
}

export interface VoskListenSession {
  stop: () => void;
}

/** Start offline mic capture + Vosk recognition. Works in the packaged Electron app. */
export async function startVoskListening(
  onTranscript: (text: string) => void,
): Promise<VoskListenSession> {
  const model = await preloadVoskModel();
  const audioContext = new AudioContext();
  const sampleRate = audioContext.sampleRate;
  const recognizer = new model.KaldiRecognizer(sampleRate, CARD_GRAMMAR);

  recognizer.on('result', (message) => {
    if (message.event !== 'result') return;
    const text = message.result.text.trim();
    if (text) onTranscript(text);
  });

  const stream = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
  });

  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  processor.onaudioprocess = (event) => {
    try {
      recognizer.acceptWaveform(event.inputBuffer);
    } catch {
      // acceptWaveform can throw if the worker is still starting.
    }
  };

  // ScriptProcessor must be wired into the graph to receive buffers; gain 0 avoids playback.
  const mute = audioContext.createGain();
  mute.gain.value = 0;
  source.connect(processor);
  processor.connect(mute);
  mute.connect(audioContext.destination);

  return {
    stop: () => {
      stream.getTracks().forEach((t) => t.stop());
      processor.disconnect();
      source.disconnect();
      mute.disconnect();
      recognizer.remove();
      void audioContext.close();
    },
  };
}
