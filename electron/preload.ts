import { contextBridge, ipcRenderer } from 'electron';

// The single, typed surface the renderer is allowed to touch. Mirrored by the
// `Window['api']` declaration in src/types/ipc.ts.
const api = {
  saveSession: (name: string, data: unknown) =>
    ipcRenderer.invoke('session:save', name, data) as Promise<{ ok: boolean; file: string }>,
  loadSession: (name: string) => ipcRenderer.invoke('session:load', name) as Promise<unknown>,
  listSessions: () => ipcRenderer.invoke('session:list') as Promise<string[]>,
  listSessionDetails: () =>
    ipcRenderer.invoke('session:listDetails') as Promise<
      Array<{
        name: string;
        savedAt: number;
        sessionType: string;
        venue?: string;
        systemId: string;
        systemName: string;
        cardsSeen: number;
        roundsPlayed: number;
        peakTrueCount: number;
        edgeProxy: number;
        durationMs: number;
        maxPenetration: number;
        tcStrongPct: number;
        netPnL: number;
        winRate: number;
        handsLogged: number;
      }>
    >,
  deleteSession: (name: string) =>
    ipcRenderer.invoke('session:delete', name) as Promise<{ ok: boolean }>,
  getSpeechModelUrl: () => ipcRenderer.invoke('speech:modelUrl') as Promise<string>,
};

contextBridge.exposeInMainWorld('api', api);

export type DesktopApi = typeof api;
