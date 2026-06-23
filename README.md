# Card Counter
Eaton Beavers
<img 
  src="https://raw.githubusercontent.com/EatonBeavers/card-counter/main/banner.jpg" 
  width="100%" 
  alt="EatonBeavers"/>
A **local-first** desktop blackjack **card-counting trainer and live-session assistant** for Windows (also builds on macOS/Linux). Built with **Electron + React + TypeScript + Vite**. Runs entirely offline — no cloud, no telemetry.

Enter dealt cards by keyboard, click, or **offline voice**; pick from 13 counting systems; get running count, true count, betting guidance, insurance prompts, and a **session database** for reviewing profitable table conditions.

**Repository:** [github.com/EatonBeavers/card-counter](https://github.com/EatonBeavers/card-counter)

---

## About

Card Counter is an independent, free tool for practicing and running live count sessions at the table. It is designed for serious counters who want:

- Fast card entry without leaving the felt
- Multiple established and experimental count systems (including real-valued AI-evolved placeholders)
- True count, penetration, and advantage-zone awareness
- Bet ramp recommendations tied to your bankroll and table limits
- Session analytics (peak TC, edge proxy, zone distribution) saved locally

**Card counting is legal in many jurisdictions** but casinos may refuse service or back you off. This app is for **training and personal analysis only**. Use responsibly and know your local rules.

---

## Features

### Live counting
- **Keyboard:** `A 2–9 0/T` add cards · `Shift+rank` burn · hotkeys for undo, next round, reset · `?` cheat sheet
- **GUI:** rank pad + full 52-card deck grid
- **Voice (offline):** say *"ace, ten, four, queen"* — powered by Vosk, no internet required in the packaged app

### Systems & betting
- **13 counting systems** — Hi-Lo, Hi-Opt II, Omega II, Zen, Wong Halves, Uston APC, Revere variants, RV #91–#94
- **True count engine** with auto or manual decks-remaining
- **Editable bet ramps** with table min/max and bankroll-risk caps
- **Insurance guidance** scaled to your active system

### Session database
- Save sessions with **frozen table context** (rules, ramp, system)
- Analytics: peak/low/avg TC, edge proxy, advantage zones, TC histogram
- Sortable database across live/practice/simulation sessions
- Profitable-play reference (Wong in/out, penetration, top systems by BC+PE)

---

## Install (Windows — recommended)

### Option A: Portable ZIP (no installer)

1. Download **`Card Counter-0.2.0-win.zip`** from [Releases](https://github.com/EatonBeavers/card-counter/releases) (when published), or build it yourself (below).
2. Extract to a folder, e.g. `C:\Apps\Card Counter\`
3. Run **`Card Counter.exe`**
4. If SmartScreen warns about an unsigned app: **More info** → **Run anyway**

Your data lives in `%APPDATA%\Card Counter\` (sessions, settings). Updating the app does not delete saved sessions.

### Option B: Build from source

**Requirements:** Node.js 20+, npm, ~500 MB disk for dependencies + speech model.

```bash
git clone https://github.com/EatonBeavers/card-counter.git
cd card-counter
npm install
bash scripts/download-vosk-model.sh   # ~40 MB offline speech model
npm run package:win-portable
```

Output: `release/Card Counter-0.2.0-win.zip` and `release/win-unpacked/`

On Windows with Wine you can also run `npm run package:win` for an NSIS installer.

---

## Development

```bash
npm install
bash scripts/download-vosk-model.sh
npm run dev          # Vite + Electron with hot reload
npm test             # engine unit tests
npm run typecheck
```

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev mode |
| `npm run build` | Type-check + production build |
| `npm run package:win-portable` | Windows portable ZIP |
| `npm run package:win` | Windows NSIS installer (needs Windows or Wine) |

---

## Architecture

```
electron/         Main process, preload IPC, local file persistence
src/engine/       Pure count/bet/insurance/analytics logic (unit-tested)
src/data/         Count systems registry, bet ramps, defaults
src/state/        Zustand store + session records
src/views/        Live, Systems, Ramp, Sessions, Settings, About
```

Count systems are **data, not code** — add or export JSON from the Systems browser. The engine stays framework-free.

---

## Real-valued (RV) system weights

RV Count #91–#94 ship with **placeholder weights**. Replace them in `src/data/countSystems/realValued.ts` and set `isPlaceholder: false` when you have evolved tables.

---

## Support

Crypto donations are optional — see **About** in the app. Bug reports and contributions welcome on GitHub.

---

## License

MIT — see [LICENSE](LICENSE).

---

## Disclaimer

For training and analysis. Casinos may refuse service to counters. Gamble responsibly.
