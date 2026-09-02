import type { GameSnapshot, PieceType, Position } from "../engine";
import { css, mixWhite, type ThemePalette } from "../theme";

const LOCK_FLASH_MS = 120;
const DISSOLVE_MS = 200;
const MAX_PARTICLES = 80;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface RenderOptions {
  ghost?: boolean;
  grid?: boolean;
  reduceMotion?: boolean;
  highContrast?: boolean;
}

const PIECE_HATCH: Record<PieceType, "diag" | "cross" | "dots" | "h" | "v" | "sparse" | "dense"> = {
  I: "h",
  O: "dots",
  T: "cross",
  S: "diag",
  Z: "v",
  J: "sparse",
  L: "dense",
};

export function createRenderer(canvas: HTMLCanvasElement): {
  draw(snapshot: GameSnapshot, palette: ThemePalette, now: number, options?: RenderOptions): void;
} {
  const maybeCtx = canvas.getContext("2d");
  if (!maybeCtx) {
    throw new Error("Canvas 2D context unavailable");
  }
  const ctx: CanvasRenderingContext2D = maybeCtx;

  let prev: GameSnapshot | null = null;
  let lastDrawNow = 0;
  let flashCells: Position[] = [];
  let flashUntil = 0;
  let dissolveRows: number[] = [];
  let dissolveUntil = 0;
  const particles: Particle[] = [];

  function spawnParticles(snapshot: GameSnapshot, palette: ThemePalette): void {
    const rows = snapshot.lastClearedRows;
    if (rows.length === 0) return;
    const tetris = snapshot.lastClearCount >= 4;
    const count = tetris ? 28 : 8 * Math.max(1, snapshot.lastClearCount);
    const accent = css(palette.accent);
    const lite = css(mixWhite(palette.accent, 0.45));
    for (let i = 0; i < count; i++) {
      if (particles.length >= MAX_PARTICLES) break;
      const row = rows[i % rows.length]!;
      const life = 280 + Math.random() * 160;
      particles.push({
        x: Math.random() * snapshot.cols,
        y: row + 0.5,
        vx: (Math.random() - 0.5) * 0.012,
        vy: (Math.random() - 0.85) * 0.01,
        life,
        maxLife: life,
        size: tetris ? 3 + Math.random() * 3 : 2 + Math.random() * 2,
        color: i % 3 === 0 ? accent : lite,
      });
    }
  }

  function stepParticles(dt: number): void {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]!;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function hatchCell(
    px: number,
    py: number,
    cw: number,
    ch: number,
    type: PieceType,
  ): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(px + 1, py + 1, cw - 2, ch - 2);
    ctx.clip();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.lineWidth = 1.25;
    const kind = PIECE_HATCH[type];
    if (kind === "diag") {
      ctx.beginPath();
      for (let i = -ch; i < cw + ch; i += 5) {
        ctx.moveTo(px + i, py);
        ctx.lineTo(px + i + ch, py + ch);
      }
      ctx.stroke();
    } else if (kind === "cross") {
      ctx.beginPath();
      ctx.moveTo(px + 2, py + 2);
      ctx.lineTo(px + cw - 2, py + ch - 2);
      ctx.moveTo(px + cw - 2, py + 2);
      ctx.lineTo(px + 2, py + ch - 2);
      ctx.stroke();
    } else if (kind === "dots") {
      ctx.fillRect(px + cw * 0.35, py + ch * 0.35, 3, 3);
      ctx.fillRect(px + cw * 0.6, py + ch * 0.55, 3, 3);
    } else if (kind === "h") {
      ctx.beginPath();
      ctx.moveTo(px + 2, py + ch * 0.5);
      ctx.lineTo(px + cw - 2, py + ch * 0.5);
      ctx.stroke();
    } else if (kind === "v") {
      ctx.beginPath();
      ctx.moveTo(px + cw * 0.5, py + 2);
      ctx.lineTo(px + cw * 0.5, py + ch - 2);
      ctx.stroke();
    } else if (kind === "sparse") {
      ctx.fillRect(px + 4, py + 4, 3, 3);
    } else {
      ctx.beginPath();
      for (let i = 3; i < ch - 2; i += 4) {
        ctx.moveTo(px + 2, py + i);
        ctx.lineTo(px + cw - 2, py + i);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw(snapshot: GameSnapshot, palette: ThemePalette, now: number, options: RenderOptions = {}): void {
    const ghostOn = options.ghost !== false;
    const gridOn = options.grid !== false;
    const reduce = options.reduceMotion === true;
    const highContrast = options.highContrast === true;
    const frameDt = lastDrawNow === 0 ? 16 : Math.min(50, Math.max(0, now - lastDrawNow));
    lastDrawNow = now;

    if (prev && snapshot.piecesLocked > prev.piecesLocked) {
      if (prev.active && !reduce) {
        flashCells = prev.active.cells.slice();
        flashUntil = now + LOCK_FLASH_MS;
      }
      if (snapshot.lastClearCount > 0) {
        dissolveRows = snapshot.lastClearedRows.slice();
        dissolveUntil = now + (reduce ? 16 : DISSOLVE_MS);
        if (!reduce) spawnParticles(snapshot, palette);
      }
    }

    if (!reduce) stepParticles(frameDt);
    else particles.length = 0;

    const visibleRows = snapshot.rows - snapshot.visibleStartRow;
    const cellW = canvas.width / snapshot.cols;
    const cellH = canvas.height / visibleRows;

    ctx.fillStyle = css(palette.well);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const flashLeft = flashUntil - now;
    const flashAmt = flashLeft > 0 ? flashLeft / LOCK_FLASH_MS : 0;
    const flashSet = new Set(flashCells.map((c) => `${c.x},${c.y}`));

    for (let vy = 0; vy < visibleRows; vy++) {
      const gy = vy + snapshot.visibleStartRow;
      const row = snapshot.grid[gy];
      for (let x = 0; x < snapshot.cols; x++) {
        const px = x * cellW;
        const py = vy * cellH;
        const cell = row ? row[x] ?? null : null;
        if (!cell) {
          ctx.fillStyle = css(palette.empty);
          ctx.fillRect(px + 1, py + 1, cellW - 2, cellH - 2);
          continue;
        }
        let fill = palette.pieces[cell];
        if (flashAmt > 0 && flashSet.has(`${x},${gy}`)) {
          fill = mixWhite(fill, flashAmt);
        }
        ctx.fillStyle = css(fill);
        ctx.fillRect(px + 1, py + 1, cellW - 2, cellH - 2);
        if (highContrast) hatchCell(px, py, cellW, cellH, cell);
      }
    }

    if (ghostOn && snapshot.active && snapshot.ghost.length > 0) {
      const color = css(palette.pieces[snapshot.active.type]);
      ctx.save();
      ctx.globalAlpha = palette.ghostAlpha;
      ctx.fillStyle = color;
      for (const cell of snapshot.ghost) {
        if (cell.y < snapshot.visibleStartRow) continue;
        const vy = cell.y - snapshot.visibleStartRow;
        ctx.fillRect(cell.x * cellW + 1, vy * cellH + 1, cellW - 2, cellH - 2);
      }
      ctx.restore();
      ctx.strokeStyle = color;
      ctx.globalAlpha = Math.min(0.7, palette.ghostAlpha + 0.28);
      ctx.lineWidth = 1.5;
      for (const cell of snapshot.ghost) {
        if (cell.y < snapshot.visibleStartRow) continue;
        const vy = cell.y - snapshot.visibleStartRow;
        ctx.strokeRect(cell.x * cellW + 2, vy * cellH + 2, cellW - 4, cellH - 4);
      }
      ctx.globalAlpha = 1;
    }

    if (snapshot.active) {
      const fill = palette.pieces[snapshot.active.type];
      ctx.fillStyle = css(fill);
      for (const cell of snapshot.active.cells) {
        if (cell.y < snapshot.visibleStartRow) continue;
        const vy = cell.y - snapshot.visibleStartRow;
        const px = cell.x * cellW;
        const py = vy * cellH;
        ctx.fillRect(px + 1, py + 1, cellW - 2, cellH - 2);
        if (highContrast) hatchCell(px, py, cellW, cellH, snapshot.active.type);
      }
    }

    if (dissolveUntil > now && dissolveRows.length > 0) {
      const amt = (dissolveUntil - now) / DISSOLVE_MS;
      ctx.fillStyle = css(mixWhite(palette.accent, 0.65));
      ctx.globalAlpha = Math.max(0, amt) * 0.85;
      for (const gy of dissolveRows) {
        if (gy < snapshot.visibleStartRow) continue;
        const vy = gy - snapshot.visibleStartRow;
        ctx.fillRect(0, vy * cellH, canvas.width, cellH);
      }
      ctx.globalAlpha = 1;
    }

    if (gridOn) {
      ctx.strokeStyle = css(palette.gridLine);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= snapshot.cols; x++) {
        const px = x * cellW;
        ctx.moveTo(px, 0);
        ctx.lineTo(px, canvas.height);
      }
      for (let y = 0; y <= visibleRows; y++) {
        const py = y * cellH;
        ctx.moveTo(0, py);
        ctx.lineTo(canvas.width, py);
      }
      ctx.stroke();
    }

    for (const p of particles) {
      const vy = p.y - snapshot.visibleStartRow;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(
        p.x * cellW - p.size / 2,
        vy * cellH - p.size / 2,
        p.size,
        p.size,
      );
    }
    ctx.globalAlpha = 1;

    prev = snapshot;
  }

  return { draw };
}
