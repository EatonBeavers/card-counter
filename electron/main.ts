import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import http from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Built output layout:
//   dist-electron/main.js
//   dist-electron/preload.mjs
//   dist/index.html
process.env.APP_ROOT = path.join(__dirname, '..');
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

const SPEECH_MODEL_NAME = 'vosk-model-small-en-us.tar.gz';
/** Fixed port — packaged app UI + speech model are both served here (same origin for Vosk). */
export const LOCAL_APP_PORT = 47391;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.gz': 'application/gzip',
};

let win: BrowserWindow | null = null;
let localAppServer: http.Server | null = null;

function speechModelFilePath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'models', SPEECH_MODEL_NAME);
  }
  return path.join(process.env.APP_ROOT!, 'public', 'models', SPEECH_MODEL_NAME);
}

function localAppOrigin(): string {
  return `http://127.0.0.1:${LOCAL_APP_PORT}`;
}

function speechModelHttpUrl(): string {
  return `${localAppOrigin()}/model`;
}

function contentType(filePath: string): string {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

async function serveDistFile(pathname: string, res: http.ServerResponse): Promise<void> {
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  const filePath = path.normalize(path.join(RENDERER_DIST, rel));
  const distRoot = path.normalize(RENDERER_DIST);

  if (!filePath.startsWith(distRoot)) {
    res.writeHead(403);
    res.end();
    return;
  }

  try {
    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      await serveDistFile(`${pathname.replace(/\/?$/, '')}/index.html`, res);
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType(filePath),
      'Content-Length': stat.size,
    });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404);
    res.end();
  }
}

/**
 * Packaged builds load from file:// but Vosk's blob worker must fetch the model over
 * HTTP on the same origin — serve dist + model from one local server.
 */
async function ensureLocalAppServer(): Promise<void> {
  if (localAppServer) return;

  const modelPath = speechModelFilePath();
  const modelStat = await fs.stat(modelPath);

  localAppServer = http.createServer((req, res) => {
    void (async () => {
      const pathname = new URL(req.url ?? '/', localAppOrigin()).pathname;

      if (pathname === '/model') {
        res.writeHead(200, {
          'Content-Type': 'application/gzip',
          'Content-Length': modelStat.size,
        });
        createReadStream(modelPath).pipe(res);
        return;
      }

      await serveDistFile(pathname, res);
    })();
  });

  await new Promise<void>((resolve, reject) => {
    localAppServer!.once('error', reject);
    localAppServer!.listen(LOCAL_APP_PORT, '127.0.0.1', () => resolve());
  });
}

function sessionsDir(): string {
  return path.join(app.getPath('userData'), 'sessions');
}

async function ensureSessionsDir(): Promise<string> {
  const dir = sessionsDir();
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

function safeName(name: string): string {
  return name.replace(/[^a-z0-9._-]/gi, '_');
}

function createWindow(): void {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    backgroundColor: '#0c0f14',
    show: false,
    autoHideMenuBar: true,
    title: 'Card Counter',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.once('ready-to-show', () => win?.show());

  win.webContents.setWindowOpenHandler(({ url }) => {
    const isLocalApp = url.startsWith(localAppOrigin());
    if (url.startsWith('http') && !isLocalApp) shell.openExternal(url);
    return { action: 'deny' };
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadURL(`${localAppOrigin()}/`);
  }
}

// ---------------------------------------------------------------------------
// IPC: local-first session & system definition persistence (no cloud).
// ---------------------------------------------------------------------------

ipcMain.handle('session:save', async (_e, name: string, data: unknown) => {
  const dir = await ensureSessionsDir();
  const file = path.join(dir, `${safeName(name)}.json`);
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
  return { ok: true, file };
});

ipcMain.handle('session:load', async (_e, name: string) => {
  const dir = await ensureSessionsDir();
  const file = path.join(dir, `${safeName(name)}.json`);
  const raw = await fs.readFile(file, 'utf-8');
  return JSON.parse(raw);
});

ipcMain.handle('session:list', async () => {
  const dir = await ensureSessionsDir();
  const entries = await fs.readdir(dir);
  return entries
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));
});

ipcMain.handle('session:listDetails', async () => {
  const dir = await ensureSessionsDir();
  const entries = await fs.readdir(dir);
  const items: Array<Record<string, unknown>> = [];

  for (const file of entries.filter((f) => f.endsWith('.json'))) {
    const name = file.replace(/\.json$/, '');
    try {
      const raw = await fs.readFile(path.join(dir, file), 'utf-8');
      const data = JSON.parse(raw) as {
        version?: number;
        savedAt?: number;
        meta?: {
          sessionType?: string;
          venue?: string;
          systemId?: string;
          systemName?: string;
        };
        summary?: {
          cardsSeen?: number;
          roundsPlayed?: number;
          peakTrueCount?: number;
          edgeProxy?: number;
          durationMs?: number;
          maxPenetration?: number;
          tcStrongPct?: number;
        };
        session?: { updatedAt?: number; systemId?: string };
      };

      if (data.version === 1 && data.summary && data.meta) {
        items.push({
          name,
          savedAt: data.savedAt ?? 0,
          sessionType: data.meta.sessionType ?? 'practice',
          venue: data.meta.venue,
          systemId: data.meta.systemId ?? '',
          systemName: data.meta.systemName ?? '',
          cardsSeen: data.summary.cardsSeen ?? 0,
          roundsPlayed: data.summary.roundsPlayed ?? 0,
          peakTrueCount: data.summary.peakTrueCount ?? 0,
          edgeProxy: data.summary.edgeProxy ?? 0,
          durationMs: data.summary.durationMs ?? 0,
          maxPenetration: data.summary.maxPenetration ?? 0,
          tcStrongPct: data.summary.tcStrongPct ?? 0,
        });
      } else if (data.session) {
        items.push({
          name,
          savedAt: data.session.updatedAt ?? 0,
          sessionType: 'practice',
          systemId: data.session.systemId ?? '',
          systemName: data.session.systemId ?? '',
          cardsSeen: 0,
          roundsPlayed: 0,
          peakTrueCount: 0,
          edgeProxy: 0,
          durationMs: 0,
          maxPenetration: 0,
          tcStrongPct: 0,
        });
      }
    } catch {
      // skip corrupt files
    }
  }

  return items.sort((a, b) => (b.savedAt as number) - (a.savedAt as number));
});

ipcMain.handle('session:delete', async (_e, name: string) => {
  const dir = await ensureSessionsDir();
  const file = path.join(dir, `${safeName(name)}.json`);
  await fs.rm(file, { force: true });
  return { ok: true };
});

ipcMain.handle('speech:modelUrl', async () => {
  await ensureLocalAppServer();
  return speechModelHttpUrl();
});

app.whenReady().then(async () => {
  if (!VITE_DEV_SERVER_URL) {
    await ensureLocalAppServer();
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
  win = null;
});

app.on('will-quit', () => {
  localAppServer?.close();
  localAppServer = null;
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
