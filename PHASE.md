# Phasenstatus

## Phase 0+1 — complete (merged in PR #1)

- Vite + TypeScript strict + Vitest
- Engine/Renderer/Input/UI-Trennung
- Spielbarer Kernloop: 7-Bag, Gravity, Lock-Delay, Line-Clear, Hard/Soft Drop, CW-Rotation, Game Over + Restart
- Canvas 10x20 visible well, dunkles Glass-Chrome

## Phase 2 — complete (merged in PR #2)

- SRS wall-kicks (JLSTZ 5-test, I-table, O in place) + CW / CCW / 180 (TETR.IO / SRS+ 180)
- Hold (1× pro Teil, C / Shift), Snapshot `hold` + `canHold`
- Next-Queue × 5 (`peek` am 7-Bag)
- Ghost (engine-berechnet, transluzent gezeichnet)
- DAS/ARR engine-owned (`leftDown`/`rightDown`, Default 133 / 33 ms)
- Lock-Delay + Move-Reset (Cap 15)
- Spawn peek in die sichtbare Zeile; Soft Drop sofort bei Keydown
- UI: Hold | Board | Next×5

## Phase 3 — complete

- Score-Formeln in `src/engine/score.ts` (rein, unit-testbar): Line-Clear, T-Spin/Mini, B2B ×1.5, Combo, Perfect Clear, Drop-Punkte
- T-Spin 3-Corner + Kick-Flag am Lock; Mini wenn Wall-Kick (nicht (0,0)), nie Mini bei 4 Ecken / Double / Triple
- Level = floor(lines/10)+1; Gravity-Tabelle (Lv20+ Instant-Drop, Lock-Delay bleibt); Lock-Delay enger ab Lv12
- Snapshot: `score`, `level`, `combo`, `b2b`, `timeMs`, `piecesLocked`, `pps`
- HUD: Score, Level, Linien, Combo, B2B, Zeit (m:ss), PPS (1 Dezimal)
- Highscore Top 10 in `src/ui/highscore.ts` (localStorage, nicht Engine); Game-Over Name (3 Zeichen) + Liste
- Engine bleibt DOM-frei

## Phase 4 — not started

Design/Themes (8 Themes), Audio, Touch, Title/Settings/How-to.
