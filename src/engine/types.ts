export const COLS = 10;
export const ROWS = 22;
export const VISIBLE_ROWS = 20;
export const VISIBLE_START_ROW = 2;

export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type Cell = PieceType | null;

export type Grid = Cell[][];

export type Action =
  | "left"
  | "right"
  | "cw"
  | "soft"
  | "hard"
  | "tick"
  | "restart";

export interface Position {
  x: number;
  y: number;
}

export interface ActivePiece {
  type: PieceType;
  x: number;
  y: number;
  rotation: number;
  cells: Position[];
}

export interface GameSnapshot {
  cols: number;
  rows: number;
  visibleStartRow: number;
  grid: Grid;
  active: ActivePiece | null;
  gameOver: boolean;
  locking: boolean;
  linesClearedTotal: number;
  lastClearCount: number;
}

export interface GameOptions {
  bag?: PieceType[];
  seed?: number;
  gravityMs?: number;
  lockMs?: number;
  softDropMs?: number;
  grid?: Grid;
}

export interface Game {
  dispatch(action: Action, dt?: number): void;
  getSnapshot(): GameSnapshot;
}
