# Tetris Apex

Hochwertiges Browser-Tetris. Phase 6 complete: README, Tests, GitHub Pages.

Gameplay-Logik lebt in `src/engine/` (reines TypeScript, kein DOM). Canvas malt nur ein Snapshot; Tastatur, Touch und HTML-Overlays sind getrennt. Themes liegen in `src/theme/`. Highscores und Settings liegen in `src/ui/` (localStorage). Audio liegt in `src/audio/` und ist komplett prozedural.

## Audio (original / frei)

Alle SFX und die Theme-Musik werden zur Laufzeit mit Web-Audio-Oscillatoren und Noise erzeugt (`src/audio/`). Es gibt **keine** MP3/OGG-Dateien, keine Downloads und keine eingebetteten Third-Party-Samples — insbesondere **kein** Korobeiniki und keine Nintendo-Tetris-Musik. Theme-Paletten `soundSlots` sind Synth-Patch-IDs (Wellenform/Skala), keine Dateipfade.

Mute schaltet Master auf 0. Reduce Motion stummschaltet **nicht**. Line-Clear / Tetris / T-Spin ducken die Musik kurz (~300 ms).

Lautstärke: Settings → Master / SFX / Musik (0–100) und Mute.

## Settings

Key: `tetris-apex-settings`. How-to-Play gesehen: `tetris-apex-howto-seen`.

- Master / SFX / Musik, Mute
- DAS ms, ARR ms (gelten live und für neue Spiele)
- Ghost, Grid
- Tasten-Remap (KeyboardEvent.code): Links, Rechts, Soft, Hard, CW, CCW, 180, Hold, Pause — Defaults bleiben Pfeile / X / Z / A / C / Space / Esc; leeres Remap fällt auf Defaults zurück
- Colorblind: off | deuteranopia | protanopia | high-contrast
- Reduce Motion: sofortiger Theme-Wechsel, keine Particles, kein Lock-Flash, Dissolve 1 Frame
- Fullscreen (Settings und HUD)

Colorblind und Reduce Motion ändern Gravity, Score und SRS nicht.

## Screens

title, play, pause, gameover, settings, howto, highscores.

How to Play: 4 skippable Karten auf Deutsch (Ziel, Steuern, Hold/Next, Score-Basics) mit Skip / Weiter / Fertig. First-Run-Overlay ist optional und blockiert Play nie.

## Themes

Neon City, Deep Ocean, Aurora Forest, Desert Night, Space Station, Volcanic Core, Crystal Cave, Cyber Rain.

Start zufaellig; nie zweimal hintereinander. Restart (Title→Play, Overlay, R) würfelt neu via `theme.reset()`. 70% Wechsel bei Level-Up, Zwang nach 40 gelockten Teilen ohne Level-Up. Crossfade 0.8-1.2s (sofort bei Reduce Motion). Themes aendern Gravity, Score, SRS, DAS usw. nicht.

## Touch (Portrait)

Zonen ums Board: Links, Rechts, Rotate (Tap), Soft (halten), Hard (Swipe runter oder Button), Hold. Pointer-Events, große Hit-Areas. Desktop-Tastatur bleibt unangetastet; Keyboard-only braucht kein Touch.

## Setup

```
npm install
npm test
npm run dev
npm run build
```

GitHub Pages: https://romi-walker.github.io/tetris-apex/

## Steuerung

Links/Rechts DAS/ARR. Hoch oder X: CW. Runter: Soft Drop. Leertaste: Hard Drop. Z oder Ctrl: CCW. A: 180. C oder Shift: Hold. Esc: Pause/Weiter. Enter: Play vom Titel. R: Neustart (im Spiel / Game Over).

## HUD

Score, Level, Linien, Combo (ab 2), B2B-Badge, Zeit (m:ss), PPS (eine Dezimalstelle). Game Over zeigt Score, 3-Zeichen-Namenseingabe (wenn Top-10 und Score > 0) und die Highscore-Liste.

## Architektur

- src/engine/ — Board, Teile, 7-Bag, SRS-Kicks, Gravity/Level, DAS/ARR, Hold, Ghost, Lock + Move-Reset, T-Spin, Score-Formeln, Line-Clear, Game Over, Event-Queue (`consumeEvents`). Snapshot kann lastClearedRows enthalten (nur Anzeige).
- src/engine/score.ts — reine Punkte-/Level-/T-Spin-Formeln (ohne DOM)
- src/theme/ — Theme-IDs, Paletten, seedbarer Switch-Controller, Farb-Lerp, Colorblind-Transform, Contrast-Helper
- src/audio/ — prozedurale SFX + Theme-Beds, Unlock, Mute, Ducking (kein DOM in der Engine)
- src/render/ — Snapshot + Palette; Ghost, Lock-Flash, Line-Dissolve, Particles, High-Contrast-Hatch
- src/input/ — Tastatur (Remap) und Touch zu Engine-Actions (nur im Play-Screen)
- src/ui/ — HUD, Screens, Game-Over, Highscore Top 10 (`tetris-apex-highscores`), Settings (`tetris-apex-settings`)

Intern 10x22 (Zeilen 0-1 Hidden Spawn). Spawn-Origin Y = 1 (Peek in Zeile 2). Level startet bei 1 und steigt alle 10 Linien. Gravity Lv20+ droppt sofort auf die unterste legale Zelle, Lock-Delay bleibt.

Scoring (x Level, ausser Soft/Hard Drop): Single 100, Double 300, Triple 500, Tetris 800; T-Spin Mini 100, T-Spin 400, Double 700, Triple 1100; B2B x1.5 auf Tetris und T-Spin/Mini mit mindestens 1 Linie; Combo 50 x comboCount x Level; Perfect Clear 800/1200/1800/2000. Soft Drop +1/Zelle, Hard Drop +2/Zelle.

Beide Horizontal-Tasten gehalten: die zuletzt gedrueckte Seite gewinnt; Loslassen der aktiven Seite nimmt die andere wieder auf (wie ein frischer Druck).

Deploy: Branch gh-pages (Vite dist). pages.yml needs the OAuth workflow scope and may be missing on main. The live URL does not depend on it.
