import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BetRamp,
  CardEntryEvent,
  Rank,
  RuleSet,
  SessionListItem,
  SessionRecord,
  SessionState,
  SessionType,
  Settings,
  Suit,
} from '../types';
import { isDesktop } from '../types';
import { getSystemOrDefault } from '../data/countSystems';
import { DEFAULT_BET_RAMPS } from '../data/betRamps';
import { DEFAULT_RULESET, DEFAULT_SETTINGS } from '../data/defaults';
import { recommendBet } from '../engine';
import { createSession, makeId } from './sessionFactory';
import { deriveLiveStats } from './derive';
import { buildRoundRecord, sessionBankroll } from '../engine/sessionPnl';
import { buildSessionRecord, normalizeSessionRecord, sessionListItem } from './sessionRecord';
import type { RoundOutcome } from '../types';

const LOCAL_SESSION_DB_KEY = 'card-counter-saved-sessions';

export type ViewId = 'live' | 'systems' | 'ramps' | 'history' | 'settings' | 'about';

interface AppState {
  settings: Settings;
  rules: RuleSet;
  ramps: BetRamp[];
  activeRampId: string;
  session: SessionState;
  insurancePromptEnabled: boolean;
  view: ViewId;

  // --- navigation ---
  setView: (view: ViewId) => void;

  // --- card entry ---
  addCard: (rank: Rank, suit?: Suit) => void;
  addBurnCard: (rank: Rank, suit?: Suit) => void;
  undoCard: () => void;
  undoRound: () => void;
  nextRound: () => void;
  logRoundOutcome: (outcome: RoundOutcome, bet?: number) => void;
  resetShoe: () => void;
  toggleInsurancePrompt: () => void;

  // --- session lifecycle ---
  newSession: (name?: string) => void;
  setSystem: (systemId: string) => void;
  setDecksOverride: (decks: number | null) => void;
  renameSession: (name: string) => void;
  updateSessionMeta: (patch: { venue?: string; notes?: string; sessionType?: SessionType }) => void;

  // --- config ---
  updateSettings: (patch: Partial<Settings>) => void;
  updateRules: (patch: Partial<RuleSet>) => void;
  upsertRamp: (ramp: BetRamp) => void;
  deleteRamp: (id: string) => void;
  setActiveRamp: (id: string) => void;

  // --- persistence (local files via Electron IPC) ---
  saveSessionToDisk: (name: string) => Promise<void>;
  loadSessionFromDisk: (name: string) => Promise<void>;
  listDiskSessions: () => Promise<string[]>;
  listSessionDetails: () => Promise<SessionListItem[]>;
  loadSessionRecord: (name: string) => Promise<SessionRecord>;
  deleteDiskSession: (name: string) => Promise<void>;
}

function appendCard(state: AppState, rank: Rank, suit: Suit | undefined, burn: boolean): SessionState {
  const event: CardEntryEvent = {
    id: makeId('card'),
    card: suit ? { rank, suit } : { rank },
    at: Date.now(),
    round: state.session.round,
    burn,
  };
  const events = [...state.session.events, event];
  const nextSession: SessionState = { ...state.session, events, updatedAt: Date.now() };

  // Record a count snapshot for history/charts.
  const system = getSystemOrDefault(state.session.systemId);
  const stats = deriveLiveStats(nextSession, system, state.rules, state.settings);
  nextSession.history = [
    ...state.session.history,
    {
      at: event.at,
      cardsSeen: stats.cardsSeen,
      runningCount: stats.runningCount,
      trueCount: stats.trueCount,
      decksRemaining: stats.decksRemaining,
    },
  ];
  return nextSession;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      rules: DEFAULT_RULESET,
      ramps: DEFAULT_BET_RAMPS,
      activeRampId: DEFAULT_SETTINGS.defaultBetRampId,
      session: createSession(DEFAULT_SETTINGS.defaultSystemId),
      insurancePromptEnabled: true,
      view: 'live',

      setView: (view) => set({ view }),

      addCard: (rank, suit) => set((s) => ({ session: appendCard(s, rank, suit, false) })),
      addBurnCard: (rank, suit) => set((s) => ({ session: appendCard(s, rank, suit, true) })),

      undoCard: () =>
        set((s) => {
          if (s.session.events.length === 0) return s;
          return {
            session: {
              ...s.session,
              events: s.session.events.slice(0, -1),
              history: s.session.history.slice(0, -1),
              updatedAt: Date.now(),
            },
          };
        }),

      undoRound: () =>
        set((s) => {
          const round = s.session.round;
          if (round === 0 && s.session.events.length === 0) return s;
          const roundToClear = s.session.events.some((e) => e.round === round) ? round : round - 1;
          const keep = s.session.events.filter((e) => e.round < roundToClear);
          const roundOutcomes = s.session.roundOutcomes.filter((o) => o.round !== roundToClear);
          return {
            session: {
              ...s.session,
              events: keep,
              history: s.session.history.slice(0, keep.length),
              round: Math.max(0, roundToClear),
              roundOutcomes,
              updatedAt: Date.now(),
            },
          };
        }),

      nextRound: () =>
        set((s) => ({ session: { ...s.session, round: s.session.round + 1, updatedAt: Date.now() } })),

      logRoundOutcome: (outcome, bet) =>
        set((s) => {
          const system = getSystemOrDefault(s.session.systemId);
          const stats = deriveLiveStats(s.session, system, s.rules, s.settings);
          const ramp = s.ramps.find((r) => r.id === s.activeRampId) ?? s.ramps[0]!;
          const bankroll = sessionBankroll(s.session, s.rules.startingBankroll);
          const defaultBet =
            bet ??
            recommendBet(
              stats.trueCount,
              ramp,
              s.rules,
              bankroll,
              s.settings.bankrollRiskFraction,
            ).amount;
          const wager = Math.max(s.rules.tableMin, defaultBet);
          const record = buildRoundRecord(
            s.session.round,
            outcome,
            wager,
            stats.trueCount,
            stats.runningCount,
            s.rules.blackjackPayout,
            makeId('round'),
          );
          const without = s.session.roundOutcomes.filter((o) => o.round !== s.session.round);
          return {
            session: {
              ...s.session,
              roundOutcomes: [...without, record],
              round: s.session.round + 1,
              updatedAt: Date.now(),
            },
          };
        }),

      resetShoe: () =>
        set((s) => ({
          session: {
            ...s.session,
            events: [],
            history: [],
            round: 0,
            decksRemainingOverride: null,
            shoeResets: s.session.shoeResets + 1,
            updatedAt: Date.now(),
          },
        })),

      toggleInsurancePrompt: () =>
        set((s) => ({ insurancePromptEnabled: !s.insurancePromptEnabled })),

      newSession: (name) =>
        set((s) => ({ session: createSession(s.settings.defaultSystemId, name), view: 'live' })),

      setSystem: (systemId) =>
        set((s) => ({ session: { ...s.session, systemId, updatedAt: Date.now() } })),

      setDecksOverride: (decks) =>
        set((s) => ({ session: { ...s.session, decksRemainingOverride: decks } })),

      renameSession: (name) => set((s) => ({ session: { ...s.session, name } })),

      updateSessionMeta: (patch) =>
        set((s) => ({
          session: { ...s.session, ...patch, updatedAt: Date.now() },
        })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      updateRules: (patch) => set((s) => ({ rules: { ...s.rules, ...patch } })),

      upsertRamp: (ramp) =>
        set((s) => {
          const idx = s.ramps.findIndex((r) => r.id === ramp.id);
          const ramps = idx >= 0 ? s.ramps.map((r) => (r.id === ramp.id ? ramp : r)) : [...s.ramps, ramp];
          return { ramps };
        }),

      deleteRamp: (id) =>
        set((s) => {
          if (s.ramps.length <= 1) return s; // keep at least one ramp
          const ramps = s.ramps.filter((r) => r.id !== id);
          const activeRampId = s.activeRampId === id ? ramps[0]!.id : s.activeRampId;
          return { ramps, activeRampId };
        }),

      setActiveRamp: (id) => set({ activeRampId: id }),

      saveSessionToDisk: async (name) => {
        const state = get();
        const record = buildSessionRecord(
          { ...state.session, name },
          {
            rules: state.rules,
            settings: state.settings,
            ramps: state.ramps,
            activeRampId: state.activeRampId,
          },
        );

        if (isDesktop()) {
          await window.api!.saveSession(name, record);
          return;
        }

        const db = readLocalSessionDb();
        db[safeLocalName(name)] = record;
        writeLocalSessionDb(db);
      },

      loadSessionFromDisk: async (name) => {
        const record = await get().loadSessionRecord(name);
        set({ session: record.session, view: 'live' });
      },

      loadSessionRecord: async (name) => {
        const ctx = () => {
          const s = get();
          return {
            rules: s.rules,
            settings: s.settings,
            ramps: s.ramps,
            activeRampId: s.activeRampId,
          };
        };

        if (isDesktop()) {
          const data = await window.api!.loadSession(name);
          return normalizeSessionRecord(data, ctx());
        }

        const db = readLocalSessionDb();
        const record = db[safeLocalName(name)];
        if (!record) throw new Error(`Session "${name}" not found`);
        return normalizeSessionRecord(record, ctx());
      },

      listDiskSessions: async () => {
        if (isDesktop()) return window.api!.listSessions();
        return Object.values(readLocalSessionDb()).map((r) => r.session.name);
      },

      listSessionDetails: async () => {
        if (isDesktop()) {
          const rows = await window.api!.listSessionDetails();
          return rows.map((r) => ({
            ...r,
            sessionType: r.sessionType as SessionType,
            netPnL: r.netPnL ?? 0,
            winRate: r.winRate ?? 0,
            handsLogged: r.handsLogged ?? 0,
          }));
        }

        const db = readLocalSessionDb();
        return Object.entries(db)
          .map(([key, record]) => sessionListItem(record.session.name || key, record))
          .sort((a, b) => b.savedAt - a.savedAt);
      },

      deleteDiskSession: async (name) => {
        if (isDesktop()) {
          await window.api!.deleteSession(name);
          return;
        }
        const db = readLocalSessionDb();
        delete db[safeLocalName(name)];
        writeLocalSessionDb(db);
      },
    }),
    {
      name: 'card-counter-state',
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Record<string, unknown>;
        const session = state.session as Record<string, unknown> | undefined;
        if (session) {
          if (session.sessionType === undefined) session.sessionType = 'practice';
          if (session.shoeResets === undefined) session.shoeResets = 0;
          if (session.roundOutcomes === undefined) session.roundOutcomes = [];
        }
        return state;
      },
      // Persist config + the in-progress session to localStorage; disk files are
      // for named, explicitly-saved sessions.
      partialize: (s) => ({
        settings: s.settings,
        rules: s.rules,
        ramps: s.ramps,
        activeRampId: s.activeRampId,
        session: s.session,
        insurancePromptEnabled: s.insurancePromptEnabled,
      }),
    },
  ),
);

function safeLocalName(name: string): string {
  return name.replace(/[^a-z0-9._-]/gi, '_');
}

function readLocalSessionDb(): Record<string, SessionRecord> {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_DB_KEY);
    return raw ? (JSON.parse(raw) as Record<string, SessionRecord>) : {};
  } catch {
    return {};
  }
}

function writeLocalSessionDb(db: Record<string, SessionRecord>): void {
  localStorage.setItem(LOCAL_SESSION_DB_KEY, JSON.stringify(db));
}
