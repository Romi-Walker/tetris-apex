# Tetris Apex

Hochwertiges Browser-Tetris. Phase 2: Guideline-SRS, Hold, Next, Ghost, DAS/ARR.

Gameplay-Logik lebt in `src/engine/` (reines TypeScript, kein DOM). Canvas malt nur ein Snapshot; Tastatur und HTML-Overlays sind getrennt.

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

## Architektur

- `src/engine/` — Board, Teile, 7-Bag (next + peek), SRS-Kicks, Gravity, DAS/ARR, Hold, Ghost, Lock + Move-Reset, Line-Clear, Game Over, `tick(dt)`
- `src/render/` — liest Snapshot, zeichnet 10x20 sichtbares Feld plus Ghost; Mini-Previews fuer Hold/Next
- `src/input/` — Tastatur zu Engine-Actions (leftDown/leftUp, ...)
- `src/ui/` — Game-Over-Overlay, Hold-Well, Next x5, Linien

Intern 10x22 (Zeilen 0-1 Hidden Spawn). Spawn-Origin Y = 1 (Peek in Zeile 2). Kein Score, Level, Theme-Pack, Audio oder Touch in dieser Phase.

Beide Horizontal-Tasten gehalten: die zuletzt gedrueckte Seite gewinnt; Loslassen der aktiven Seite nimmt die andere wieder auf (wie ein frischer Druck).
