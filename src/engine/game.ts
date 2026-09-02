import { createBagRandomizer } from "./bag";
import { clearLines, cloneGrid, collides, emptyGrid, findFullRows, lockPiece } from "./board";
import { kicksFor } from "./kicks";
import { cellsOf, spawnOriginX, spawnOriginY } from "./pieces";
import {
  classifyTSpin,
  dropPoints,
  gravityMsForLevel,
  isGridEmpty,
  levelFromLines,
  lockMsForLevel,
  piecesPerSecond,
  scoreLock,
  tSpinCornerCount,
  type LastAction,
} from "./score";
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
  type Position,
} from "./types";

const DEFAULT_SOFT_DROP_MS = 50;
const DEFAULT_DAS_MS = 133;
const DEFAULT_ARR_MS = 33;
const DEFAULT_LOCK_RESET_MAX = 15;
const NEXT_QUEUE_LEN = 5;

type DasDir = -1 | 0 | 1;

interface LivePiece {
  type: PieceType;
  x: number;
  y: number;
  rotation: number;
  lastAction: LastAction | null;
  lastKickIndex: number;
  usedKick: boolean;
}

interface InternalState {
  grid: Grid;
  active: LivePiece | null;
  hold: PieceType | null;
  canHold: boolean;
  gameOver: boolean;
  locking: boolean;
  lockElapsed: number;
  lockResets: number;
  gravityElapsed: number;
  softHeld: boolean;
  heldLeft: boolean;
  heldRight: boolean;
  dasDir: DasDir;
  dasElapsed: number;
  dasCharged: boolean;
  linesClearedTotal: number;
  lastClearCount: number;
  lastClearedRows: number[];
  score: number;
  combo: number;
  b2b: boolean;
  timeMs: number;
  piecesLocked: number;
}

export function createGame(options: GameOptions = {}): Game {
  const softDropMs = options.softDropMs ?? DEFAULT_SOFT_DROP_MS;
  const dasMs = options.dasMs ?? DEFAULT_DAS_MS;
  const arrMs = options.arrMs ?? DEFAULT_ARR_MS;
  const lockResetMax = options.lockResetMax ?? DEFAULT_LOCK_RESET_MAX;
  const randomizer = createBagRandomizer(options.bag, options.seed);
  const initialGrid = options.grid ? cloneGrid(options.grid) : emptyGrid();

  let state: InternalState = boot();

  function currentLevel(s: InternalState = state): number {
    return levelFromLines(s.linesClearedTotal);
  }

  function currentGravityMs(s: InternalState = state): number {
    return options.gravityMs ?? gravityMsForLevel(currentLevel(s));
  }

  function currentLockMs(s: InternalState = state): number {
    return options.lockMs ?? lockMsForLevel(currentLevel(s));
  }

  function boot(): InternalState {
    const next: InternalState = {
      grid: options.grid ? cloneGrid(options.grid) : cloneGrid(initialGrid),
      active: null,
      hold: null,
      canHold: true,
      gameOver: false,
      locking: false,
      lockElapsed: 0,
      lockResets: 0,
      gravityElapsed: 0,
      softHeld: false,
      heldLeft: false,
      heldRight: false,
      dasDir: 0,
      dasElapsed: 0,
      dasCharged: false,
      linesClearedTotal: 0,
      lastClearCount: 0,
      lastClearedRows: [],
      score: 0,
      combo: 0,
      b2b: false,
      timeMs: 0,
      piecesLocked: 0,
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

  function ghostOf(s: InternalState): Position[] {
    const piece = s.active;
    if (!piece) return [];
    let gy = piece.y;
    while (!collides(s.grid, piece.type, piece.x, gy + 1, piece.rotation)) {
      gy += 1;
    }
    return cellsOf(piece.type, piece.x, gy, piece.rotation);
  }

  function snapDown(s: InternalState): number {
    let cells = 0;
    while (tryMove(0, 1, false, s)) {
      cells += 1;
    }
    return cells;
  }

  function applyInfiniteGravity(s: InternalState): void {
    if (s.gameOver || !s.active) return;
    if (currentGravityMs(s) > 0) return;
    snapDown(s);
    const piece = s.active;
    if (piece && grounded(s, piece)) {
      s.locking = true;
    }
  }

  function placePiece(s: InternalState, type: PieceType): void {
    const piece: LivePiece = {
      type,
      x: spawnOriginX(type),
      y: spawnOriginY(type),
      rotation: 0,
      lastAction: null,
      lastKickIndex: 0,
      usedKick: false,
    };
    s.active = piece;
    s.locking = false;
    s.lockElapsed = 0;
    s.lockResets = 0;
    s.gravityElapsed = 0;
    if (collides(s.grid, piece.type, piece.x, piece.y, piece.rotation)) {
      s.gameOver = true;
      return;
    }
    applyInfiniteGravity(s);
  }

  function spawn(s: InternalState, type?: PieceType): void {
    placePiece(s, type ?? randomizer.next());
  }

  function grounded(s: InternalState, piece: LivePiece): boolean {
    return collides(s.grid, piece.type, piece.x, piece.y + 1, piece.rotation);
  }

  function onShiftOrRotate(): void {
    const s = state;
    const piece = s.active;
    if (!piece) return;
    const isGrounded = grounded(s, piece);
    if (s.locking || isGrounded) {
      if (s.lockResets < lockResetMax) {
        s.lockResets += 1;
        s.lockElapsed = 0;
      }
    }
    if (s.locking && !isGrounded) {
      s.locking = false;
      s.lockElapsed = 0;
    }
  }

  function tryMove(
    dx: number,
    dy: number,
    resetLock: boolean,
    target: InternalState = state,
  ): boolean {
    const s = target;
    if (s.gameOver || !s.active) return false;
    const piece = s.active;
    const nx = piece.x + dx;
    const ny = piece.y + dy;
    if (collides(s.grid, piece.type, nx, ny, piece.rotation)) {
      return false;
    }
    piece.x = nx;
    piece.y = ny;
    if (dy > 0) piece.lastAction = "drop";
    else if (dx !== 0) piece.lastAction = "move";
    if (resetLock) {
      onShiftOrRotate();
    } else if (s.locking && !grounded(s, piece)) {
      s.locking = false;
      s.lockElapsed = 0;
    }
    return true;
  }

  function tryRotate(delta: 1 | -1 | 2): boolean {
    const s = state;
    if (s.gameOver || !s.active) return false;
    const piece = s.active;
    const from = piece.rotation;
    const to = (from + delta + 4) % 4;
    const kicks = kicksFor(piece.type, from, to);
    for (let i = 0; i < kicks.length; i++) {
      const kick = kicks[i];
      if (!kick) continue;
      const [kx, ky] = kick;
      const nx = piece.x + kx;
      const ny = piece.y + ky;
      if (!collides(s.grid, piece.type, nx, ny, to)) {
        piece.x = nx;
        piece.y = ny;
        piece.rotation = to;
        piece.lastAction = "rotate";
        piece.lastKickIndex = i;
        piece.usedKick = i > 0;
        onShiftOrRotate();
        return true;
      }
    }
    return false;
  }

  function lockActive(): void {
    const s = state;
    const piece = s.active;
    if (!piece) return;
    lockPiece(s.grid, piece.type, piece.x, piece.y, piece.rotation);
    const corners =
      piece.type === "T" && piece.lastAction === "rotate"
        ? tSpinCornerCount(s.grid, piece.x, piece.y)
        : 0;
    const lastClearedRows = findFullRows(s.grid);
    const cleared = clearLines(s.grid);
    const tSpin =
      piece.type === "T" && piece.lastAction === "rotate"
        ? classifyTSpin(corners, piece.usedKick, cleared)
        : "none";
    const pc = isGridEmpty(s.grid);
    const level = currentLevel(s);
    const awarded = scoreLock({
      lines: cleared,
      tSpin,
      level,
      b2bReady: s.b2b,
      comboCount: s.combo,
      perfectClear: pc,
    });
    s.score += awarded.points;
    s.b2b = awarded.nextB2b;
    s.combo = awarded.nextCombo;
    s.lastClearCount = cleared;
    s.lastClearedRows = lastClearedRows;
    s.linesClearedTotal += cleared;
    s.piecesLocked += 1;
    s.active = null;
    s.locking = false;
    s.lockElapsed = 0;
    s.lockResets = 0;
    s.gravityElapsed = 0;
    s.canHold = true;
    if (!s.gameOver) {
      spawn(s);
    }
  }

  function stepDown(): boolean {
    const s = state;
    if (!s.active) return false;
    if (tryMove(0, 1, false)) {
      return true;
    }
    if (s.lockResets >= lockResetMax) {
      lockActive();
      return false;
    }
    s.locking = true;
    return false;
  }

  function hardDrop(): void {
    const s = state;
    if (s.gameOver || !s.active) return;
    let cells = 0;
    while (tryMove(0, 1, false)) {
      cells += 1;
    }
    s.score += dropPoints(cells, "hard");
    lockActive();
  }

  function holdPiece(): void {
    const s = state;
    if (s.gameOver || !s.active || !s.canHold) return;
    const current = s.active.type;
    s.canHold = false;
    s.softHeld = false;
    if (s.hold === null) {
      s.hold = current;
      spawn(s);
    } else {
      const swapped = s.hold;
      s.hold = current;
      spawn(s, swapped);
    }
  }

  function startDas(dir: Exclude<DasDir, 0>): void {
    state.dasDir = dir;
    state.dasElapsed = 0;
    state.dasCharged = false;
    tryMove(dir, 0, true);
  }

  function stopDas(): void {
    state.dasDir = 0;
    state.dasElapsed = 0;
    state.dasCharged = false;
  }

  function onLeftDown(): void {
    state.heldLeft = true;
    startDas(-1);
  }

  function onLeftUp(): void {
    state.heldLeft = false;
    if (state.dasDir === -1) {
      if (state.heldRight) startDas(1);
      else stopDas();
    }
  }

  function onRightDown(): void {
    state.heldRight = true;
    startDas(1);
  }

  function onRightUp(): void {
    state.heldRight = false;
    if (state.dasDir === 1) {
      if (state.heldLeft) startDas(-1);
      else stopDas();
    }
  }

  function tickDas(ms: number): void {
    const s = state;
    if (s.dasDir === 0 || s.gameOver || !s.active) return;
    s.dasElapsed += ms;
    const dir = s.dasDir;
    if (!s.dasCharged) {
      if (s.dasElapsed < dasMs) return;
      s.dasElapsed -= dasMs;
      s.dasCharged = true;
      tryMove(dir, 0, true);
    }
    if (arrMs <= 0) {
      while (tryMove(dir, 0, true)) {
        // ARR 0: slide to the wall
      }
      s.dasElapsed = 0;
      return;
    }
    while (s.dasElapsed >= arrMs) {
      s.dasElapsed -= arrMs;
      tryMove(dir, 0, true);
    }
  }

  function onSoftDown(): void {
    const s = state;
    if (s.gameOver || !s.active) return;
    s.softHeld = true;
    s.gravityElapsed = 0;
    if (stepDown()) {
      s.score += dropPoints(1, "soft");
    }
  }

  function onSoftUp(): void {
    state.softHeld = false;
    state.gravityElapsed = 0;
  }

  function tick(dt: number): void {
    const s = state;
    if (s.gameOver || !s.active) return;
    const ms = Math.max(0, dt);
    s.timeMs += ms;

    tickDas(ms);

    if (s.gameOver || !s.active) return;

    const lockMs = currentLockMs(s);

    if (s.locking) {
      if (!grounded(s, s.active)) {
        s.locking = false;
        s.lockElapsed = 0;
      } else if (s.lockResets >= lockResetMax) {
        lockActive();
        return;
      } else {
        s.lockElapsed += ms;
        if (s.lockElapsed >= lockMs) {
          lockActive();
          return;
        }
      }
    }

    if (s.gameOver || !s.active || s.locking) {
      return;
    }

    if (currentGravityMs(s) <= 0 && !s.softHeld) {
      applyInfiniteGravity(s);
      return;
    }

    const interval = s.softHeld ? softDropMs : currentGravityMs(s);
    s.gravityElapsed += ms;
    while (interval > 0 && s.gravityElapsed >= interval) {
      s.gravityElapsed -= interval;
      if (!stepDown()) {
        s.gravityElapsed = 0;
        break;
      }
      if (s.softHeld) {
        s.score += dropPoints(1, "soft");
      }
    }
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
        tryMove(-1, 0, true);
        break;
      case "right":
        tryMove(1, 0, true);
        break;
      case "leftDown":
        onLeftDown();
        break;
      case "leftUp":
        onLeftUp();
        break;
      case "rightDown":
        onRightDown();
        break;
      case "rightUp":
        onRightUp();
        break;
      case "cw":
        tryRotate(1);
        break;
      case "ccw":
        tryRotate(-1);
        break;
      case "flip":
        tryRotate(2);
        break;
      case "softDown":
        onSoftDown();
        break;
      case "softUp":
        onSoftUp();
        break;
      case "hard":
        hardDrop();
        break;
      case "hold":
        holdPiece();
        break;
      case "tick":
        tick(dt);
        break;
    }
  }

  function getSnapshot(): GameSnapshot {
    const s = state;
    const level = currentLevel(s);
    return {
      cols: COLS,
      rows: ROWS,
      visibleStartRow: VISIBLE_START_ROW,
      grid: cloneGrid(s.grid),
      active: s.active ? toActive(s.active) : null,
      ghost: ghostOf(s),
      hold: s.hold,
      canHold: s.canHold,
      next: randomizer.peek(NEXT_QUEUE_LEN),
      gameOver: s.gameOver,
      locking: s.locking,
      lockElapsed: s.lockElapsed,
      linesClearedTotal: s.linesClearedTotal,
      lastClearCount: s.lastClearCount,
      lastClearedRows: s.lastClearedRows.slice(),
      score: s.score,
      level,
      combo: s.combo,
      b2b: s.b2b,
      timeMs: s.timeMs,
      piecesLocked: s.piecesLocked,
      pps: piecesPerSecond(s.piecesLocked, s.timeMs),
    };
  }

  return { dispatch, getSnapshot };
}
