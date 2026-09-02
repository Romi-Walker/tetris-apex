# Tetris Apex

Hochwertiges Browser-Tetris. Phase 3: Score, T-Spin, Level, Highscore.

Gameplay-Logik lebt in `src/engine/` (reines TypeScript, kein DOM). Canvas malt nur ein Snapshot; Tastatur und HTML-Overlays sind getrennt. Highscores liegen in `src/ui/highscore.ts` (localStorage).

## Setup

```bash
npm install
npm test
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

Spiel im Browser: Vite-URL (meist `http://localhost:5173`).

## Steuerung

| Taste | Aktion |
| --- | --- |
| Links / Rechts | DAS/ARR bewegen |
| Hoch oder X | Drehen im Uhrzeigersinn (SRS-Kicks) |
| Runter | Sofort 1 Zelle Soft Drop, dann Repeat |
| Leertaste | Hard Drop |
| Z oder Ctrl | Gegen den Uhrzeigersinn |
| A | 180-Drehung (TETR.IO / SRS+ Kicks) |
| C oder Shift | Hold (einmal pro Teil bis Lock) |
| R | Neustart |

## HUD

Score, Level, Linien, Combo, B2B-Badge, Zeit (`m:ss`), PPS (eine Dezimalstelle). Game Over zeigt Score, 3-Zeichen-Namenseingabe (wenn Top-10) und die Highscore-Liste.

## Architektur

- `src/engine/` — Board, Teile, 7-Bag, SRS-Kicks, Gravity/Level, DAS/ARR, Hold, Ghost, Lock + Move-Reset, T-Spin, Score-Formeln, Line-Clear, Game Over, `tick(dt)`
- `src/engine/score.ts` — reine Punkte-/Level-/T-Spin-Formeln (ohne DOM)
- `src/render/` — liest Snapshot, zeichnet 10x20 sichtbares Feld plus Ghost; Mini-Previews fuer Hold/Next
- `src/input/` — Tastatur zu Engine-Actions (leftDown/leftUp, ...)
- `src/ui/` — HUD, Game-Over-Overlay, Highscore Top 10 (`localStorage` Key `tetris-apex-highscores`)

Intern 10x22 (Zeilen 0-1 Hidden Spawn). Spawn-Origin Y = 1 (Peek in Zeile 2). Level startet bei 1 und steigt alle 10 Linien. Gravity Lv20+ droppt sofort auf die unterste legale Zelle, Lock-Delay bleibt. Kein Theme-Pack, Audio oder Touch in dieser Phase.

Scoring (x Level, ausser Soft/Hard Drop): Single 100, Double 300, Triple 500, Tetris 800; T-Spin Mini 100, T-Spin 400, Double 700, Triple 1100; B2B x1.5 auf Tetris und T-Spin/Mini mit mindestens 1 Linie; Combo 50 x comboCount x Level; Perfect Clear 800/1200/1800/2000. Soft Drop +1/Zelle, Hard Drop +2/Zelle.

Beide Horizontal-Tasten gehalten: die zuletzt gedrueckte Seite gewinnt; Loslassen der aktiven Seite nimmt die andere wieder auf (wie ein frischer Druck).
