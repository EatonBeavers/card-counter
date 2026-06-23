import { getSystemOrDefault } from '../data/countSystems';
import { computeSessionSummary } from '../engine/sessionAnalytics';
import type { BetRamp, RuleSet, SessionListItem, SessionMeta, SessionRecord, SessionState, Settings } from '../types';

interface BuildContext {
  rules: RuleSet;
  settings: Settings;
  ramps: BetRamp[];
  activeRampId: string;
}

export function buildSessionMeta(session: SessionState, ctx: BuildContext): SessionMeta {
  const system = getSystemOrDefault(session.systemId);
  const ramp = ctx.ramps.find((r) => r.id === ctx.activeRampId) ?? ctx.ramps[0]!;

  return {
    rules: { ...ctx.rules },
    settings: {
      displayPrecision: ctx.settings.displayPrecision,
      deckPrecision: ctx.settings.deckPrecision,
      decksMode: ctx.settings.decksMode,
      bankrollRiskFraction: ctx.settings.bankrollRiskFraction,
    },
    betRamp: { ...ramp, tiers: ramp.tiers.map((t) => ({ ...t })) },
    systemId: system.id,
    systemName: system.name,
    venue: session.venue,
    notes: session.notes,
    sessionType: session.sessionType,
  };
}

export function buildSessionRecord(session: SessionState, ctx: BuildContext): SessionRecord {
  const meta = buildSessionMeta(session, ctx);
  const summary = computeSessionSummary(session, meta);

  return {
    version: 1,
    savedAt: Date.now(),
    session: { ...session },
    meta,
    summary,
  };
}

export function sessionListItem(name: string, record: SessionRecord): SessionListItem {
  const { summary, meta, savedAt } = record;
  return {
    name,
    savedAt,
    sessionType: meta.sessionType,
    venue: meta.venue,
    systemId: meta.systemId,
    systemName: meta.systemName,
    cardsSeen: summary.cardsSeen,
    roundsPlayed: summary.roundsPlayed,
    peakTrueCount: summary.peakTrueCount,
    edgeProxy: summary.edgeProxy,
    durationMs: summary.durationMs,
    maxPenetration: summary.maxPenetration,
    tcStrongPct: summary.tcStrongPct,
  };
}

/** Accept legacy saves that were raw SessionState JSON. */
export function normalizeSessionRecord(data: unknown, ctx?: BuildContext): SessionRecord {
  if (isSessionRecord(data)) return data;

  const session = migrateSessionState(data);
  if (!ctx) {
    throw new Error('Cannot migrate legacy session without app context');
  }

  const meta = buildSessionMeta(session, ctx);
  return {
    version: 1,
    savedAt: session.updatedAt,
    session,
    meta,
    summary: computeSessionSummary(session, meta),
  };
}

function isSessionRecord(data: unknown): data is SessionRecord {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as SessionRecord).version === 1 &&
    !!(data as SessionRecord).meta &&
    !!(data as SessionRecord).summary
  );
}

function migrateSessionState(data: unknown): SessionState {
  const s = data as SessionState;
  return {
    ...s,
    sessionType: s.sessionType ?? 'practice',
    shoeResets: s.shoeResets ?? 0,
  };
}
