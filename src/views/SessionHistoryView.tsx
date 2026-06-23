import { useCallback, useEffect, useMemo, useState } from 'react';
import { Panel } from '../components/ui/Panel';
import { SessionAnalyticsPanel } from '../components/sessions/SessionAnalyticsPanel';
import {
  SessionAggregateBar,
  SessionDatabaseTable,
} from '../components/sessions/SessionDatabaseTable';
import { ProfitPlayGuide } from '../components/sessions/ProfitPlayGuide';
import { computeSessionSummary } from '../engine';
import { buildSessionMeta } from '../state/sessionRecord';
import { useStore } from '../state/store';
import type { SessionListItem, SessionRecord, SessionType } from '../types';

export function SessionHistoryView(): JSX.Element {
  const session = useStore((s) => s.session);
  const rules = useStore((s) => s.rules);
  const settings = useStore((s) => s.settings);
  const ramps = useStore((s) => s.ramps);
  const activeRampId = useStore((s) => s.activeRampId);
  const precision = useStore((s) => s.settings.displayPrecision);

  const saveSessionToDisk = useStore((s) => s.saveSessionToDisk);
  const loadSessionFromDisk = useStore((s) => s.loadSessionFromDisk);
  const loadSessionRecord = useStore((s) => s.loadSessionRecord);
  const listSessionDetails = useStore((s) => s.listSessionDetails);
  const deleteDiskSession = useStore((s) => s.deleteDiskSession);
  const renameSession = useStore((s) => s.renameSession);
  const updateSessionMeta = useStore((s) => s.updateSessionMeta);
  const newSession = useStore((s) => s.newSession);

  const [dbItems, setDbItems] = useState<SessionListItem[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<SessionRecord | null>(null);
  const [status, setStatus] = useState('');

  const liveMeta = useMemo(
    () => buildSessionMeta(session, { rules, settings, ramps, activeRampId }),
    [session, rules, settings, ramps, activeRampId],
  );

  const liveSummary = useMemo(
    () => computeSessionSummary(session, liveMeta),
    [session, liveMeta],
  );

  const refresh = useCallback(async () => {
    const items = await listSessionDetails();
    setDbItems(items);
  }, [listSessionDetails]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function onSave(): Promise<void> {
    await saveSessionToDisk(session.name);
    setStatus(`Saved "${session.name}" to database`);
    void refresh();
  }

  async function onSelect(name: string): Promise<void> {
    setSelectedName(name);
    try {
      const record = await loadSessionRecord(name);
      setSelectedRecord(record);
    } catch {
      setSelectedRecord(null);
    }
  }

  async function onLoad(name: string): Promise<void> {
    await loadSessionFromDisk(name);
    setStatus(`Loaded "${name}" — switch to Live to continue`);
  }

  async function onDelete(name: string): Promise<void> {
    await deleteDiskSession(name);
    if (selectedName === name) {
      setSelectedName(null);
      setSelectedRecord(null);
    }
    void refresh();
  }

  return (
    <div>
      <div className="view-header">
        <div>
          <h2>Session Database</h2>
          <div className="sub">
            Track count quality, edge conditions, and table context across sessions
          </div>
        </div>
        <div className="btn-row">
          <button className="btn ghost" onClick={() => newSession()}>
            New Session
          </button>
          <button className="btn primary" onClick={onSave}>
            Save to Database
          </button>
        </div>
      </div>

      {status && (
        <p className="text-faint" style={{ fontSize: 12, marginTop: -8 }}>
          {status}
        </p>
      )}

      <SessionAggregateBar items={dbItems} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <Panel title="Current session">
          <div className="session-meta-form">
            <label>
              Name
              <input
                type="text"
                value={session.name}
                onChange={(e) => renameSession(e.target.value)}
              />
            </label>
            <label>
              Venue / casino
              <input
                type="text"
                placeholder="e.g. Bellagio $25 min"
                value={session.venue ?? ''}
                onChange={(e) => updateSessionMeta({ venue: e.target.value })}
              />
            </label>
            <label>
              Type
              <select
                value={session.sessionType ?? 'practice'}
                onChange={(e) => updateSessionMeta({ sessionType: e.target.value as SessionType })}
              >
                <option value="practice">Practice</option>
                <option value="live">Live</option>
                <option value="simulation">Simulation</option>
              </select>
            </label>
            <label className="full">
              Notes
              <textarea
                rows={2}
                placeholder="Table rules quirks, dealer speed, heat, back-off…"
                value={session.notes ?? ''}
                onChange={(e) => updateSessionMeta({ notes: e.target.value })}
              />
            </label>
          </div>
          <p className="text-faint" style={{ fontSize: 11, margin: '8px 0 0' }}>
            {session.events.length} cards · {liveSummary.roundsPlayed} rounds · saves rules, ramp,
            and analytics snapshot
          </p>
        </Panel>

        <ProfitPlayGuide />
      </div>

      <div style={{ marginTop: 16 }}>
        <SessionAnalyticsPanel
          title="Current session analytics"
          summary={liveSummary}
          meta={liveMeta}
          precision={precision}
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <SessionDatabaseTable
          items={dbItems}
          precision={precision}
          selectedName={selectedName}
          onSelect={(name) => void onSelect(name)}
          onLoad={(name) => void onLoad(name)}
          onDelete={(name) => void onDelete(name)}
        />
      </div>

      {selectedRecord && (
        <div style={{ marginTop: 16 }}>
          <SessionAnalyticsPanel
            title={`Saved: ${selectedRecord.session.name}`}
            summary={selectedRecord.summary}
            meta={selectedRecord.meta}
            precision={precision}
          />
          {selectedRecord.meta.notes && (
            <div style={{ marginTop: 16 }}>
              <Panel title="Session notes">
                <p style={{ margin: 0, fontSize: 13, whiteSpace: 'pre-wrap' }}>
                  {selectedRecord.meta.notes}
                </p>
              </Panel>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
