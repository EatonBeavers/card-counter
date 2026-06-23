import type { DesktopApi } from '../../electron/preload';

declare global {
  interface Window {
    /** Present only inside Electron; guard with `isDesktop()` before use. */
    api?: DesktopApi;
  }
}

export function isDesktop(): boolean {
  return typeof window !== 'undefined' && !!window.api;
}

export {};
