# Tetris Apex

Hochwertiges Browser-Tetris. Phase 4: 8 Themes, Screens, FX.

Gameplay-Logik lebt in `src/engine/` (reines TypeScript, kein DOM). Canvas malt nur ein Snapshot; Tastatur und HTML-Overlays sind getrennt. Themes liegen in `src/theme/` (Auswahl/Switch + Paletten, keine Regeln). Highscores liegen in `src/ui/highscore.ts` (localStorage).


## Screens

title, play, pause, gameover, settings, howto, highscores.

Titel-Buttons: Play, How to Play, Settings, Highscores. Esc pausiert/setzt fort im Spiel. Enter startet vom Titel. Pause und Game Over haben einen Title-Button. Settings sind Platzhalter (kommt in Phase 5).

## Themes

Neon City, Deep Ocean, Aurora Forest, Desert Night, Space Station, Volcanic Core, Crystal Cave, Cyber Rain.

Start zufaellig; nie zweimal hintereinander. 70% Wechsel bei Level-Up, Zwang nach 40 gelockten Teilen ohne Level-Up. Crossfade 0.8-1.2s. Themes aendern Gravity, Score, SRS, DAS usw. nicht.

## Setup

Install dependencies, run tests, then start the Vite dev server. Production uses the TypeScript check plus Vite build.

## Steuerung

Links/Rechts DAS/ARR. Hoch oder X: CW. Runter: Soft Drop. Leertaste: Hard Drop. Z oder Ctrl: CCW. A: 180. C oder Shift: Hold. Esc: Pause/Weiter. Enter: Play vom Titel. R: Neustart (im Spiel / Game Over).

## HUD

Score, Level, Linien, Combo (ab 2), B2B-Badge, Zeit (m:ss), PPS (eine Dezimalstelle). Game Over zeigt Score, 3-Zeichen-Namenseingabe (wenn Top-10 und Score > 0) und die Highscore-Liste.

## Architektur

- src/engine/ — Board, Teile, 7-Bag, SRS-Kicks, Gravity/Level, DAS/ARR, Hold, Ghost, Lock + Move-Reset, T-Spin, Score-Formeln, Line-Clear, Game Over. Snapshot kann lastClearedRows enthalten (nur Anzeige).
- src/engine/score.ts — reine Punkte-/Level-/T-Spin-Formeln (ohne DOM)
- src/theme/ — Theme-IDs, Paletten, seedbarer Switch-Controller, Farb-Lerp. Sound-Slot-IDs als leere Platzhalter, keine Samples.
- src/render/ — Snapshot + Palette; Ghost, Lock-Flash, Line-Dissolve, Particles
- src/input/ — Tastatur zu Engine-Actions (nur im Play-Screen)
- src/ui/ — HUD, Screens, Game-Over, Highscore Top 10 (localStorage Key tetris-apex-highscores)

Intern 10x22 (Zeilen 0-1 Hidden Spawn). Spawn-Origin Y = 1 (Peek in Zeile 2). Level startet bei 1 und steigt alle 10 Linien. Gravity Lv20+ droppt sofort auf die unterste legale Zelle, Lock-Delay bleibt. Kein Audio, Touch oder Colorblind-Modus in dieser Phase.

Scoring (x Level, ausser Soft/Hard Drop): Single 100, Double 300, Triple 500, Tetris 800; T-Spin Mini 100, T-Spin 400, Double 700, Triple 1100; B2B x1.5 auf Tetris und T-Spin/Mini mit mindestens 1 Linie; Combo 50 x comboCount x Level; Perfect Clear 800/1200/1800/2000. Soft Drop +1/Zelle, Hard Drop +2/Zelle.

Beide Horizontal-Tasten gehalten: die zuletzt gedrueckte Seite gewinnt; Loslassen der aktiven Seite nimmt die andere wieder auf (wie ein frischer Druck).
