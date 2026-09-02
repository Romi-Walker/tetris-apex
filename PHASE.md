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

## Phase 4 — complete

Design/Themes und Screens. Keine Audio-Samples, kein Touch, keine Colorblind-Modi (Phase 5).

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
- Sound-Slot-IDs als leere Platzhalter, keine Samples/Musik

## Phase 5 — not started

Audio, Touch, Accessibility (Colorblind, Reduce Motion als Option).
