import { COLS, ROWS, type Grid, type PieceType } from "./types";

export type TSpinKind = "none" | "mini" | "full";

export type LastAction = "move" | "rotate" | "drop";

const GRAVITY_MS_BY_LEVEL: readonly number[] = [
  800, 800, 720, 630, 550, 470, 380, 300, 220, 140, 100, 80, 80, 50, 40, 30, 20,
  15, 10, 8,
];

const PC_BASE = [0, 800, 1200, 1800, 2000] as const;

export function levelFromLines(lines: number): number {
  return Math.floor(Math.max(0, lines) / 10) + 1;
}

export function gravityMsForLevel(level: number): number {
  if (level >= 20) return 0;
  if (level <= 1) return GRAVITY_MS_BY_LEVEL[1]!;
  return GRAVITY_MS_BY_LEVEL[level] ?? 0;
}

export function lockMsForLevel(level: number): number {
  if (level >= 20) return 200;
  if (level >= 18) return 250;
  if (level >= 15) return 300;
  if (level >= 12) return 400;
  return 500;
}

export function dropPoints(cells: number, kind: "soft" | "hard"): number {
  const n = Math.max(0, cells);
  return kind === "hard" ? n * 2 : n;
}

export function piecesPerSecond(piecesLocked: number, timeMs: number): number {
  if (timeMs <= 0) return 0;
  return piecesLocked / (timeMs / 1000);
}

export function occupiedCorner(grid: Grid, x: number, y: number): boolean {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
  const row = grid[y];
  return !row || row[x] !== null;
}

/** Four corners of the T 3x3 around origin (x, y); center is (x+1, y+1). */
export function tSpinCornerCount(grid: Grid, x: number, y: number): number {
  const corners: ReadonlyArray<readonly [number, number]> = [
    [x, y],
    [x + 2, y],
    [x, y + 2],
    [x + 2, y + 2],
  ];
  let n = 0;
  for (const [cx, cy] of corners) {
    if (occupiedCorner(grid, cx, cy)) n += 1;
  }
  return n;
}

export function classifyTSpin(corners: number, usedKick: boolean, lines: number): TSpinKind {
  if (corners < 3) return "none";
  // Mini only for 0/1-line T-Spins that used a wall-kick. 4 corners or Double/Triple are never Mini.
  const neverMini = corners >= 4 || lines >= 2;
  if (usedKick && !neverMini) return "mini";
  return "full";
}

export function detectTSpin(opts: {
  type: PieceType;
  x: number;
  y: number;
  lastAction: LastAction | null;
  usedKick: boolean;
  lines: number;
  grid: Grid;
}): TSpinKind {
  if (opts.type !== "T" || opts.lastAction !== "rotate") return "none";
  const corners = tSpinCornerCount(opts.grid, opts.x, opts.y);
  return classifyTSpin(corners, opts.usedKick, opts.lines);
}

export function lineClearBase(lines: number, tSpin: TSpinKind): number {
  if (tSpin === "mini") return 100;
  if (tSpin === "full") {
    if (lines >= 3) return 1100;
    if (lines === 2) return 700;
    return 400;
  }
  switch (lines) {
    case 1:
      return 100;
    case 2:
      return 300;
    case 3:
      return 500;
    case 4:
      return 800;
    default:
      return 0;
  }
}

export function isBackToBackClear(lines: number, tSpin: TSpinKind): boolean {
  if (tSpin !== "none" && lines >= 1) return true;
  return tSpin === "none" && lines === 4;
}

export function applyBackToBack(award: number, b2b: boolean): number {
  return b2b ? Math.floor(award * 1.5) : award;
}

export function comboAward(comboCount: number, level: number): number {
  if (comboCount <= 0) return 0;
  return 50 * comboCount * level;
}

export function perfectClearAward(lines: number, level: number): number {
  const base = PC_BASE[lines] ?? 0;
  return base * level;
}

export function isGridEmpty(grid: Grid): boolean {
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== null) return false;
    }
  }
  return true;
}

export interface LockScoreInput {
  lines: number;
  tSpin: TSpinKind;
  level: number;
  b2bReady: boolean;
  comboCount: number;
  perfectClear: boolean;
}

export interface LockScoreResult {
  points: number;
  nextB2b: boolean;
  nextCombo: number;
}

export function scoreLock(input: LockScoreInput): LockScoreResult {
  const { lines, tSpin, level, b2bReady, comboCount, perfectClear } = input;
  const worthy = isBackToBackClear(lines, tSpin);
  const base = lineClearBase(lines, tSpin) * level;
  const linePoints = applyBackToBack(base, worthy && b2bReady);
  const comboPoints = comboAward(comboCount, level);
  const pcPoints = perfectClear ? perfectClearAward(lines, level) : 0;

  let nextB2b = b2bReady;
  if (worthy) nextB2b = true;
  else if (lines > 0) nextB2b = false;

  const nextCombo = lines > 0 ? comboCount + 1 : 0;

  return {
    points: linePoints + comboPoints + pcPoints,
    nextB2b,
    nextCombo,
  };
}
