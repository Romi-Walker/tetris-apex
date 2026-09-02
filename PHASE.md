# Phasenstatus

## Phase 0+1 — complete (merged in PR #1)

- Vite + TypeScript strict + Vitest
- Engine/Renderer/Input/UI-Trennung
- Spielbarer Kernloop: 7-Bag, Gravity, Lock-Delay, Line-Clear, Hard/Soft Drop, CW-Rotation, Game Over + Restart
- Canvas 10x20 visible well, dunkles Glass-Chrome

## Phase 2 — complete

- SRS wall-kicks (JLSTZ 5-test, I-table, O in place) + CW / CCW / 180 (TETR.IO / SRS+ 180)
- Hold (1× pro Teil, C / Shift), Snapshot `hold` + `canHold`
- Next-Queue × 5 (`peek` am 7-Bag)
- Ghost (engine-berechnet, transluzent gezeichnet)
- DAS/ARR engine-owned (`leftDown`/`rightDown`, Default 133 / 33 ms)
- Lock-Delay + Move-Reset (Cap 15)
- Spawn peek in die sichtbare Zeile; Soft Drop sofort bei Keydown
- UI: Hold | Board | Next×5, kein Score/Level/Theme/Audio/Touch

## Phase 3 — not started

Score/Level, Themes, Audio, Touch.
