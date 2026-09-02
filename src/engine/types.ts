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
  | "leftDown"
  | "leftUp"
  | "rightDown"
  | "rightUp"
  | "cw"
  | "ccw"
  | "flip"
  | "softDown"
  | "softUp"
  | "hard"
  | "hold"
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

export type GameEventKind =
  | "lock"
  | "move"
  | "rotate"
  | "hold"
  | "lineClear"
  | "tetris"
  | "tSpin"
  | "levelUp"
  | "gameOver"
  | "hardDrop";

export interface GameEvent {
  kind: GameEventKind;
  lines?: number;
}

export interface GameSnapshot {
  cols: number;
  rows: number;
  visibleStartRow: number;
  grid: Grid;
  active: ActivePiece | null;
  ghost: Position[];
  hold: PieceType | null;
  canHold: boolean;
  next: PieceType[];
  gameOver: boolean;
  locking: boolean;
  lockElapsed: number;
  linesClearedTotal: number;
  lastClearCount: number;
  lastClearedRows: number[];
  score: number;
  level: number;
  combo: number;
  b2b: boolean;
  timeMs: number;
  piecesLocked: number;
  pps: number;
  events: GameEvent[];
}

export interface GameOptions {
  bag?: PieceType[];
  seed?: number;
  gravityMs?: number;
  lockMs?: number;
  softDropMs?: number;
  dasMs?: number;
  arrMs?: number;
  lockResetMax?: number;
  grid?: Grid;
}

export interface Game {
  dispatch(action: Action, dt?: number): void;
  getSnapshot(): GameSnapshot;
  consumeEvents(): GameEvent[];
  setDasMs(ms: number): void;
  setArrMs(ms: number): void;
}
