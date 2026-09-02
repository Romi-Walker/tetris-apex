import { createBagRandomizer } from "./bag";
import { clearLines, cloneGrid, collides, emptyGrid, lockPiece } from "./board";
import { cellsOf, spawnOriginX, spawnOriginY } from "./pieces";
import {
  COLS,
  ROWS,
  VISIBLE_START_ROW,
  type Action,
  type ActivePiece,
  type Game,
  type GameOptions,
  type GameSnapshot,
  type Grid,
  type PieceType,
} from "./types";

const DEFAULT_GRAVITY_MS = 800;
const DEFAULT_LOCK_MS = 500;
const DEFAULT_SOFT_DROP_MS = 50;

interface LivePiece {
  type: PieceType;
  x: number;
  y: number;
  rotation: number;
}

interface InternalState {
  grid: Grid;
  active: LivePiece | null;
  gameOver: boolean;
  locking: boolean;
  lockElapsed: number;
  gravityElapsed: number;
  softDrop: boolean;
  linesClearedTotal: number;
  lastClearCount: number;
}

export function createGame(options: GameOptions = {}): Game {
  const gravityMs = options.gravityMs ?? DEFAULT_GRAVITY_MS;
  const lockMs = options.lockMs ?? DEFAULT_LOCK_MS;
  const softDropMs = options.softDropMs ?? DEFAULT_SOFT_DROP_MS;
  const randomizer = createBagRandomizer(options.bag, options.seed);
  const initialGrid = options.grid ? cloneGrid(options.grid) : emptyGrid();

  let state: InternalState = boot();

  function boot(): InternalState {
    const next: InternalState = {
      grid: options.grid ? cloneGrid(options.grid) : cloneGrid(initialGrid),
      active: null,
      gameOver: false,
      locking: false,
      lockElapsed: 0,
      gravityElapsed: 0,
      softDrop: false,
      linesClearedTotal: 0,
      lastClearCount: 0,
    };
    spawn(next);
    return next;
  }

  function toActive(piece: LivePiece): ActivePiece {
    return {
      type: piece.type,
      x: piece.x,
      y: piece.y,
      rotation: piece.rotation,
      cells: cellsOf(piece.type, piece.x, piece.y, piece.rotation),
    };
  }

  function spawn(s: InternalState): void {
    const type = randomizer.next();
    const piece: LivePiece = {
      type,
      x: spawnOriginX(type),
      y: spawnOriginY(type),
      rotation: 0,
    };
    if (collides(s.grid, piece.type, piece.x, piece.y, piece.rotation)) {
      s.active = piece;
      s.gameOver = true;
      s.locking = false;
      return;
    }
    s.active = piece;
    s.locking = false;
    s.lockElapsed = 0;
    s.gravityElapsed = 0;
    s.softDrop = false;
  }

  function grounded(s: InternalState, piece: LivePiece): boolean {
    return collides(s.grid, piece.type, piece.x, piece.y + 1, piece.rotation);
  }

  function tryMove(dx: number, dy: number): boolean {
    const s = state;
    if (s.gameOver || !s.active) return false;
    const piece = s.active;
    const nx = piece.x + dx;
    const ny = piece.y + dy;
    if (collides(s.grid, piece.type, nx, ny, piece.rotation)) {
      return false;
    }
    piece.x = nx;
    piece.y = ny;
    if (s.locking && !grounded(s, piece)) {
      s.locking = false;
      s.lockElapsed = 0;
    }
    return true;
  }

  function tryRotateCw(): boolean {
    const s = state;
    if (s.gameOver || !s.active) return false;
    const piece = s.active;
    const nextRot = (piece.rotation + 1) % 4;
    if (collides(s.grid, piece.type, piece.x, piece.y, nextRot)) {
      return false;
    }
    piece.rotation = nextRot;
    if (s.locking && !grounded(s, piece)) {
      s.locking = false;
      s.lockElapsed = 0;
    }
    return true;
  }

  function lockActive(): void {
    const s = state;
    const piece = s.active;
    if (!piece) return;
    lockPiece(s.grid, piece.type, piece.x, piece.y, piece.rotation);
    const cleared = clearLines(s.grid);
    s.lastClearCount = cleared;
    s.linesClearedTotal += cleared;
    s.active = null;
    s.locking = false;
    s.lockElapsed = 0;
    s.gravityElapsed = 0;
    s.softDrop = false;
    if (!s.gameOver) {
      spawn(s);
    }
  }

  function stepDown(): boolean {
    const s = state;
    if (!s.active) return false;
    if (tryMove(0, 1)) {
      return true;
    }
    s.locking = true;
    return false;
  }

  function hardDrop(): void {
    const s = state;
    if (s.gameOver || !s.active) return;
    while (tryMove(0, 1)) {
      // fall
    }
    lockActive();
  }

  function tick(dt: number): void {
    const s = state;
    if (s.gameOver || !s.active) return;
    const ms = Math.max(0, dt);

    if (s.locking) {
      if (!grounded(s, s.active)) {
        s.locking = false;
        s.lockElapsed = 0;
      } else {
        s.lockElapsed += ms;
        if (s.lockElapsed >= lockMs) {
          lockActive();
          return;
        }
      }
    }

    if (s.gameOver || !s.active || s.locking) {
      s.softDrop = false;
      return;
    }

    const interval = s.softDrop ? softDropMs : gravityMs;
    s.gravityElapsed += ms;
    while (s.gravityElapsed >= interval) {
      s.gravityElapsed -= interval;
      if (!stepDown()) {
        s.gravityElapsed = 0;
        break;
      }
    }
    s.softDrop = false;
  }

  function dispatch(action: Action, dt = 0): void {
    if (action === "restart") {
      randomizer.reset();
      state = boot();
      return;
    }
    if (state.gameOver) {
      return;
    }
    switch (action) {
      case "left":
        tryMove(-1, 0);
        break;
      case "right":
        tryMove(1, 0);
        break;
      case "cw":
        tryRotateCw();
        break;
      case "soft":
        state.softDrop = true;
        break;
      case "hard":
        hardDrop();
        break;
      case "tick":
        tick(dt);
        break;
    }
  }

  function getSnapshot(): GameSnapshot {
    const s = state;
    return {
      cols: COLS,
      rows: ROWS,
      visibleStartRow: VISIBLE_START_ROW,
      grid: cloneGrid(s.grid),
      active: s.active ? toActive(s.active) : null,
      gameOver: s.gameOver,
      locking: s.locking,
      linesClearedTotal: s.linesClearedTotal,
      lastClearCount: s.lastClearCount,
    };
  }

  return { dispatch, getSnapshot };
}
