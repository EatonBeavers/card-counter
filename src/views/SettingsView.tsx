import { Panel } from '../components/ui/Panel';
import { useStore } from '../state/store';
import { COUNT_SYSTEMS } from '../data/countSystems';
import type { BlackjackPayout, DeckPrecision, DisplayPrecision, KeyBindings } from '../types';

export function SettingsView(): JSX.Element {
  const settings = useStore((s) => s.settings);
  const rules = useStore((s) => s.rules);
  const ramps = useStore((s) => s.ramps);
  const updateSettings = useStore((s) => s.updateSettings);
  const updateRules = useStore((s) => s.updateRules);

  function setKey(field: keyof KeyBindings, value: string): void {
    updateSettings({ keyBindings: { ...settings.keyBindings, [field]: value } });
  }

  return (
    <div>
      <div className="view-header">
        <div>
          <h2>Settings</h2>
          <div className="sub">All preferences are stored locally on this machine.</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Panel title="Table & Shoe Rules">
          <div className="form-grid">
            <NumberField
              label="Decks"
              value={rules.decks}
              min={1}
              max={8}
              step={1}
              onChange={(v) => updateRules({ decks: clamp(v, 1, 8) })}
            />
            <NumberField
              label="Penetration %"
              value={Math.round(rules.penetration * 100)}
              min={10}
              max={95}
              step={5}
              onChange={(v) => updateRules({ penetration: clamp(v, 10, 95) / 100 })}
            />
            <NumberField
              label="Starting Bankroll"
              value={rules.startingBankroll}
              step={100}
              onChange={(v) => updateRules({ startingBankroll: v })}
            />
            <NumberField
              label="Unit Size"
              value={rules.unitSize}
              step={5}
              onChange={(v) => updateRules({ unitSize: v })}
            />
            <NumberField
              label="Table Min"
              value={rules.tableMin}
              step={5}
              onChange={(v) => updateRules({ tableMin: v })}
            />
            <NumberField
              label="Table Max"
              value={rules.tableMax}
              step={50}
              onChange={(v) => updateRules({ tableMax: v })}
            />
          </div>

          <SelectField
            label="Blackjack Payout"
            value={rules.blackjackPayout}
            options={[
              ['3:2', '3:2 (best)'],
              ['6:5', '6:5'],
              ['2:1', '2:1'],
              ['1:1', '1:1'],
            ]}
            onChange={(v) => updateRules({ blackjackPayout: v as BlackjackPayout })}
          />

          <Toggle
            label="Dealer hits soft 17 (H17)"
            checked={rules.dealerHitsSoft17}
            onChange={(v) => updateRules({ dealerHitsSoft17: v })}
          />
          <Toggle
            label="Double after split (DAS)"
            checked={rules.doubleAfterSplit}
            onChange={(v) => updateRules({ doubleAfterSplit: v })}
          />
          <Toggle
            label="Late surrender available"
            checked={rules.lateSurrender}
            onChange={(v) => updateRules({ lateSurrender: v })}
          />
          <Toggle
            label="Insurance offered"
            checked={rules.insuranceAvailable}
            onChange={(v) => updateRules({ insuranceAvailable: v })}
          />
        </Panel>

        <div className="stack">
          <Panel title="Counting & Display">
            <SelectField
              label="Default count system"
              value={settings.defaultSystemId}
              options={COUNT_SYSTEMS.map((s) => [s.id, s.name])}
              onChange={(v) => updateSettings({ defaultSystemId: v })}
            />
            <SelectField
              label="Display precision"
              value={settings.displayPrecision}
              options={[
                ['exact', 'Exact'],
                ['oneDecimal', '1 decimal'],
                ['nearestHalf', 'Nearest half'],
                ['nearestInteger', 'Nearest integer'],
              ]}
              onChange={(v) => updateSettings({ displayPrecision: v as DisplayPrecision })}
            />
            <SelectField
              label="Decks-remaining precision"
              value={settings.deckPrecision}
              options={[
                ['full', 'Full deck'],
                ['half', 'Half deck'],
                ['quarter', 'Quarter deck'],
              ]}
              onChange={(v) => updateSettings({ deckPrecision: v as DeckPrecision })}
            />
            <SelectField
              label="Decks remaining mode"
              value={settings.decksMode}
              options={[
                ['auto', 'Auto (from cards seen)'],
                ['manual', 'Manual override'],
              ]}
              onChange={(v) => updateSettings({ decksMode: v as 'auto' | 'manual' })}
            />
          </Panel>

          <Panel title="Betting & Risk">
            <SelectField
              label="Default bet ramp"
              value={settings.defaultBetRampId}
              options={ramps.map((r) => [r.id, r.name])}
              onChange={(v) => updateSettings({ defaultBetRampId: v })}
            />
            <NumberField
              label="Bankroll risk cap (% of bankroll per bet)"
              value={Math.round(settings.bankrollRiskFraction * 100)}
              min={1}
              max={25}
              step={1}
              onChange={(v) => updateSettings({ bankrollRiskFraction: clamp(v, 1, 25) / 100 })}
            />
          </Panel>

          <Panel title="Appearance & Feedback">
            <SelectField
              label="Theme"
              value={settings.theme}
              options={[
                ['dark', 'Dark'],
                ['light', 'Light'],
              ]}
              onChange={(v) => updateSettings({ theme: v as 'dark' | 'light' })}
            />
            <Toggle
              label="Visual/sound feedback on entry"
              checked={settings.feedbackEnabled}
              onChange={(v) => updateSettings({ feedbackEnabled: v })}
            />
          </Panel>

          <Panel title="Keyboard Shortcuts">
            <div className="form-grid">
              <TextField label="Undo card" value={settings.keyBindings.undo} onChange={(v) => setKey('undo', v)} />
              <TextField label="Reset shoe" value={settings.keyBindings.reset} onChange={(v) => setKey('reset', v)} />
              <TextField label="Next round" value={settings.keyBindings.nextRound} onChange={(v) => setKey('nextRound', v)} />
              <TextField
                label="Toggle insurance"
                value={settings.keyBindings.toggleInsurance}
                onChange={(v) => setKey('toggleInsurance', v)}
              />
            </div>
            <p className="text-faint" style={{ fontSize: 11, marginBottom: 0 }}>
              Use the exact key value (e.g. "Backspace", "Enter", "r"). Rank keys A/2–9/0/T are reserved for entry.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

// --- tiny field primitives ---------------------------------------------------

function NumberField(props: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}): JSX.Element {
  return (
    <div className="field">
      <label>{props.label}</label>
      <input
        type="number"
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </div>
  );
}

function TextField(props: { label: string; value: string; onChange: (v: string) => void }): JSX.Element {
  return (
    <div className="field">
      <label>{props.label}</label>
      <input type="text" value={props.value} onChange={(e) => props.onChange(e.target.value)} />
    </div>
  );
}

function SelectField(props: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (v: string) => void;
}): JSX.Element {
  return (
    <div className="field">
      <label>{props.label}</label>
      <select value={props.value} onChange={(e) => props.onChange(e.target.value)}>
        {props.options.map(([val, lbl]) => (
          <option key={val} value={val}>
            {lbl}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle(props: { label: string; checked: boolean; onChange: (v: boolean) => void }): JSX.Element {
  return (
    <label className="toggle" style={{ marginBottom: 10 }}>
      <input type="checkbox" checked={props.checked} onChange={(e) => props.onChange(e.target.checked)} />
      <span>{props.label}</span>
    </label>
  );
}
