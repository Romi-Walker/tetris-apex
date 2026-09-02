import { COLS, ROWS, type Cell, type Grid, type PieceType } from "./types";
import { cellsOf } from "./pieces";

export function emptyGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.slice());
}

export function collides(
  grid: Grid,
  type: PieceType,
  x: number,
  y: number,
  rotation: number,
): boolean {
  for (const cell of cellsOf(type, x, y, rotation)) {
    if (cell.x < 0 || cell.x >= COLS || cell.y < 0 || cell.y >= ROWS) {
      return true;
    }
    const row = grid[cell.y];
    if (!row || row[cell.x] !== null) {
      return true;
    }
  }
  return false;
}

export function lockPiece(
  grid: Grid,
  type: PieceType,
  x: number,
  y: number,
  rotation: number,
): void {
  for (const cell of cellsOf(type, x, y, rotation)) {
    const row = grid[cell.y];
    if (row && cell.x >= 0 && cell.x < COLS) {
      row[cell.x] = type;
    }
  }
}


/** Indexes of currently complete rows (does not mutate). */
export function findFullRows(grid: Grid): number[] {
  const rows: number[] = [];
  for (let y = 0; y < ROWS; y++) {
    const row = grid[y];
    if (!row) continue;
    if (row.every((cell) => cell !== null)) {
      rows.push(y);
    }
  }
  return rows;
}

/** Remove full rows; remaining cells fall down. Returns number of cleared rows. */
export function clearLines(grid: Grid): number {
  const kept: Grid = [];
  for (let y = 0; y < ROWS; y++) {
    const row = grid[y];
    if (!row) continue;
    const full = row.every((cell) => cell !== null);
    if (!full) {
      kept.push(row);
    }
  }
  const cleared = ROWS - kept.length;
  while (kept.length < ROWS) {
    kept.unshift(Array<Cell>(COLS).fill(null));
  }
  for (let y = 0; y < ROWS; y++) {
    grid[y] = kept[y]!;
  }
  return cleared;
}
