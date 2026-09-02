# Tetris Apex

Hochwertiges Browser-Tetris. Phase 0+1: spielbarer Kernloop.

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
| Links / Rechts | Seitlich bewegen |
| Hoch oder X | Drehen im Uhrzeigersinn (ohne Wall-Kicks) |
| Runter | Soft Drop (gehalten) |
| Leertaste | Hard Drop |
| R | Neustart |

## Architektur

- `src/engine/` — Board, Teile, 7-Bag, Gravity, Collision, Lock, Line-Clear, Game Over, `tick(dt)`
- `src/render/` — liest Snapshot, zeichnet 10x20 sichtbares Feld
- `src/input/` — Tastatur zu Engine-Actions
- `src/ui/` — Game-Over-Overlay, schmales HUD (Linien)

Intern 10x22 (Zeilen 0-1 Hidden Spawn). Kein Ghost, Hold, Next, Score, Levels, Audio oder Touch in dieser Phase.
