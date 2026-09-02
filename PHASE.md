# Phasenstatus

## Phase 0+1 — complete (merged in PR #1)

- Vite + TypeScript strict + Vitest
- Engine/Renderer/Input/UI-Trennung
- Spielbarer Kernloop: 7-Bag, Gravity, Lock-Delay, Line-Clear, Hard/Soft Drop, CW-Rotation, Game Over + Restart
- Canvas 10x20 visible well, dunkles Glass-Chrome

## Phase 2 — complete (merged in PR #2)

- SRS wall-kicks (JLSTZ 5-test, I-table, O in place) + CW / CCW / 180 (TETR.IO / SRS+ 180)
- Hold (1x pro Teil, C / Shift), Snapshot `hold` + `canHold`
- Next-Queue x 5 (`peek` am 7-Bag)
- Ghost (engine-berechnet, transluzent gezeichnet)
- DAS/ARR engine-owned (`leftDown`/`rightDown`, Default 133 / 33 ms)
- Lock-Delay + Move-Reset (Cap 15)
- Spawn peek in die sichtbare Zeile; Soft Drop sofort bei Keydown
- UI: Hold | Board | Next x 5

## Phase 3 — complete (merged in PR #3)

- Score-Formeln in `src/engine/score.ts` (rein, unit-testbar): Line-Clear, T-Spin/Mini, B2B x1.5, Combo, Perfect Clear, Drop-Punkte
- T-Spin 3-Corner + Kick-Flag am Lock; Mini wenn Wall-Kick (nicht (0,0)), nie Mini bei 4 Ecken / Double / Triple
- Level = floor(lines/10)+1; Gravity-Tabelle (Lv20+ Instant-Drop, Lock-Delay bleibt); Lock-Delay enger ab Lv12
- Snapshot: `score`, `level`, `combo`, `b2b`, `timeMs`, `piecesLocked`, `pps`
- HUD: Score, Level, Linien, Combo, B2B, Zeit (m:ss), PPS (1 Dezimal)
- Highscore Top 10 in `src/ui/highscore.ts` (localStorage, nicht Engine); Game-Over Name (3 Zeichen) + Liste
- Engine bleibt DOM-frei

## Phase 4 — complete (merged in PR #4)

Design/Themes und Screens.

Themes (Namen exakt):

- Neon City
- Deep Ocean
- Aurora Forest
- Desert Night
- Space Station
- Volcanic Core
- Crystal Cave
- Cyber Rain

Screen-Keys: `title`, `play`, `pause`, `gameover`, `settings`, `howto`, `highscores`.

- Theme-Controller in `src/theme/` (Start zufaellig, nie zweimal hintereinander, 70% Switch bei Level-Up, Zwang nach 40 Locks ohne Level-Up, Crossfade 0.8-1.2s)
- Paletten nur ueber CSS-Variablen und Canvas; Themes aendern keine Gameplay-Regeln
- Visual FX im Renderer: Lock-Flash, Line-Dissolve (`lastClearedRows` im Snapshot), Particles
- Score 0 qualifiziert nicht fuer Highscore; Combo-HUD ab Combo 2

## Phase 5 — complete

Audio, Settings, Touch, Accessibility. Kein Multiplayer, Shop, Accounts.

- Procedural Web-Audio only (`src/audio/`): Oscillatoren + Noise, keine MP3/OGG, keine Korobeiniki/Nintendo/Third-Party-Samples
- SFX aus Engine-Events (`consumeEvents()`): lock, move, rotate, hold, lineClear, tetris, tSpin, levelUp, gameOver, hardDrop
- Theme-Musik: looping procedural bed (Root/Tempo/Filter je Theme), Crossfade/Retarget, Ducking ~300ms bei Line-Clear/Tetris/T-Spin
- Mute + Master/SFX/Music 0–100; AudioContext Unlock beim ersten Gesture (Play / Taste)
- Settings `localStorage` Key `tetris-apex-settings`: Volumes, Mute, DAS/ARR (live Setter), Ghost, Grid, Remap (`KeyboardEvent.code`), Colorblind, Reduce Motion
- How-to-Play: 4 skippable Karten (Ziel, Steuern, Hold/Next, Score-Basics); First-Run Overlay blockiert Play nicht
- Fullscreen (Settings + HUD), Touch-Zonen (Portrait), Reduce Motion (kein Crossfade/Particles/Lock-Flash; Dissolve 1 Frame)
- Colorblind: off | deuteranopia | protanopia | high-contrast (Palette-Transform, T vs empty bleibt distinct)
- `theme.reset()` würfelt ein neues Theme ≠ previous (Title→Play, Overlay-Restart, Game-Over R)
- Engine bleibt DOM-frei (kein document/window/localStorage/AudioContext/canvas)

## Phase 6 — complete

QA / Release. README commands, extra tests, GitHub Pages.

- README Setup with the four package scripts; Steuerung unchanged
- Extra tests: broken Settings JSON, DAS/ARR setters, Colorblind, Reduce Motion
- Pages: vite `base: "/tetris-apex/"`, workflow `.github/workflows/pages.yml`
- FX renderer-only (tick/input never pause); particle cap
- v1 overall check: Susi Go, keine Blocker/Majors
